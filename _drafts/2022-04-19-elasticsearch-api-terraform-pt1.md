---
layout: post
title: Performing Elasticsearch API calls with Terraform, part 1
description: How to reach the Elasticsearch and Elastic Cloud on Kubernetes (ECK) API with Terraform
comments: true
publish-to-medium: true
tags: terraform elasticsearch
---

## Configuring Elasticsearch with Terraform, by means of direct API calls

![A completely unrealistic work scene]({{ site.url }}{{ site.baseurl }}/assets/images/elasticsearch-api-terraform-pt1/coffee.jpg)
Photo by [Karan Thukral](https://burst.shopify.com/@kthukral?utm_campaign=photo_credit&utm_content=Free+Stock+Photo+of+Laptop+Coffee+%E2%80%94+HD+Images&utm_medium=referral&utm_source=credit) on [Burst](https://burst.shopify.com/laptop?utm_campaign=photo_credit&utm_content=Free+Stock+Photo+of+Laptop+Coffee+%E2%80%94+HD+Images&utm_medium=referral&utm_source=credit)

If you use [Terraform](https://www.terraform.io/) for automating your Elasticsearch deployments, you might find that you need to call the Elasticsearch API during your Terraform runs. Although the Elasticsearch config can cover a lot of ES settings, there are certain changes that can only be made by means of a direct API call to ES. Thankfully, by means of some clever scripting and a [null-resource](https://registry.terraform.io/providers/hashicorp/null/latest/docs/resources/resource) in Terraform, we can easily solve this issue.

NOTE: Even though the information below can be used for a regular instance of Elasticsearch, I am adapting it specifically to Elastic Cloud in Kubernetes (ECK) running on an Azure Kubernetes Service (AKS), as that is the setup we currently have in my project. This only applies to setting up a network tunnel for reaching the endpoints, as otherwise this solution should be identical for any type of ES deployment.

## Building blocks

To build the solution, we will leverage the following components:

### The Elasticsearch API

The ES API is well documented in the [official docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/rest-apis.html). We will create a script that uses `curl` to perform the calls.

### Terraform null_resource

A [null_resource](https://registry.terraform.io/providers/hashicorp/null/latest/docs/resources/resource) allows one to run an arbitrary command or script with Terraform. These resources should be configured with triggers, to ensure that they only run when needed.

To perform the calls themselves, we will create a Bash script. Let's get started!

### Connecting to Elasticsearch

Before trying to perform API calls on ES, we need to be able to _reach_ the API. If your ES API is available on your network (or over the Internet), you can probably skip these steps. In my case, our ES is self-contained inside of AKS, and the endpoints are not exposed outside of the cluster. So before we can do anything else, we need to open a tunnel to Elasticsearch.

The first step, since we are running in AKS, is to acquire credentials to connect to Kubernetes. Assuming `az cli` is already authenticated with Azure, the only information needed will be the names of the cluster and resource group.

We also create a "lock file" so the credentials are not pulled multiple times, which can help speed up subsequent runs:

```bash
if [ ! -f /tmp/kubectl_config_present ]; then
  az aks get-credentials \
    --name "$CLUSTER_NAME" \
    --resource-group "$CLUSTER_RESOURCE_GROUP" &&
  touch /tmp/kubectl_config_present;
fi
```

Then, we use the `port-forward` functionality in `kubectl` to temporarily expose the Elasticsearch API. Make sure to use the correct Kubernetes namespace for the `elasticsearch-es-http` service. We will use a random high numbered port, and add a 5 second pause, to ensure we don't try to hit the endpoint before it's fully available. We also move the process to the background (by means of `&`), since otherwise it will not release the terminal and the rest of the script won't run:

```bash
local_port=$(shuf -i 10000-65000 -n 1);

kubectl port-forward service/elasticsearch-es-http \
  --namespace default "$local_port":9200 &
sleep 5;
```

### Performing the call

With the Kubernetes service now exposed, we are able to reach the API. Lets create a flexible `curl` call that can be used for different endpoints. When we run the script, we will pass it a few variables, including the HTTP verb we want to use, the JSON body (if any), the authorization string (more on that in the next post), and the specific endpoint we want to call.

If you are not using Kubernetes, make sure to add the correct Elasticsearch URL to the `curl` call.

We also use a little "safeguard" at the end to ensure the call was actually successful.

```bash
if [ -n "$HTTP_VERB" ]; then
  verb="-X $HTTP_VERB"
else
  verb="-X GET"
fi

if [ -n "$BODY_JSON" ]; then
  body="-d ${BODY_JSON}"
else
  body=""
fi

curl --silent --show-error --fail "$verb" \
  -H "Authorization: Basic $AUTHORIZATION" \
  -H "Content-Type: application/json" "$body" \
  -k "https://localhost:$local_port"/"$ENDPOINT" \
  || { export dirty_exit="true"; };
```

### Cleaning up after ourselves

After performing our call, we should shut down the port forward in `kubectl`:

```bash
kill -2 "$(pgrep -f "kubectl port-forward.*$local_port")";
```

Finally, throw an error in case the call was not successful:

```bash
if [ "$dirty_exit" == true ]; then
  echo -e "Something went wrong! Check output above.";
  exit 1;
fi
```

### The TL;DR

Putting it all together, our script will look like this (added some comments and terminal colors on the error):

```bash
#!/bin/bash

# Pull down k8s config, only first time
if [ ! -f /tmp/kubectl_config_present ]; then
  az aks get-credentials --name "$CLUSTER_NAME" --resource-group "$CLUSTER_RESOURCE_GROUP" &&
  touch /tmp/kubectl_config_present;
fi

# Start kubectl port-forward and detach it from current console
local_port=$(shuf -i 10000-65000 -n 1);

kubectl port-forward service/elasticsearch-es-http --namespace default "$local_port":9200 &
sleep 5;

# Hit that API!
if [ -n "$HTTP_VERB" ]; then
  verb="-X $HTTP_VERB"
else
  verb="-X GET"
fi

if [ -n "$BODY_JSON" ]; then
  body="-d ${BODY_JSON}"
else
  body=""
fi

curl --silent --show-error --fail "$verb" -H "Authorization: Basic $AUTHORIZATION" -H "Content-Type: application/json" "$body" -k "https://localhost:$local_port"/"$ENDPOINT" || { export dirty_exit="true"; };

# Ctrl+C the port forward process
kill -2 "$(pgrep -f "kubectl port-forward.*$local_port")";

if [ "$dirty_exit" == true ]; then
  echo -e "\n\033[0;31mSomething went wrong! Check output above.\033[0m\n\n";
  exit 1;
fi
```
This script can be saved anywhere Terraform can see it. For convenience, I will save it to a subfolder called `./scripts/`, and will name the script `elastic_api_call.sh`.

In my next post, I will show how to run this script with a Terraform `null_resource`, as well as making sure that the resource only runs whenever we need it to.
