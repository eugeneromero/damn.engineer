---
layout: post
title: Performing Elasticsearch API calls with Terraform, part 2
description: How to reach the Elasticsearch and Elastic Cloud on Kubernetes (ECK) API with Terraform
comments: true
publish-to-linkedin: true
publish-to-medium: true
tags: terraform elasticsearch
---

## Configuring Terraform to call the Elasticsearch API

![Can't wait for robots to actually start doing all this grueling work for us]({{ site.url }}{{ site.baseurl }}/assets/images/elasticsearch-api-terraform-pt2/robots.jpg)
Photo by [Eric Krull](https://unsplash.com/@ekrull?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/robot?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

In [the previous post]({{ site.url }}{{ site.baseurl }}/2022/04/19/elasticsearch-api-terraform-pt1), we created a script to automate calls to our Elasticsearch endpoint. Let's now configure Terraform to use this script whenever we need to reach the API.

## Creating the Terraform `null_resource`

As an example, say we wanted to add a [lifecycle policy](https://www.elastic.co/guide/en/elasticsearch/reference/current/set-up-lifecycle-policy.html#:~:text=To%20create%20a%20lifecycle%20policy,policy%20to%20the%20Elasticsearch%20cluster.) to Elasticsearch. First off, let's create a variable to hold the policy definition. We use [Heredoc](https://linuxize.com/post/bash-heredoc/) syntax to make sure Terraform does not trip up on the multiline JSON definition:

```terraform
variable "lifecyclePolicy" {
  type    = map(string)
  default = {
    name   = "log-lifecycle"
    policy = <<-JSON
      {
        "policy": {
          "phases": {
            "hot": {
              "actions": {
                "rollover": {
                  "max_age": "7d"
                }
              }
            }
          }
        }
      }
    JSON
  }
}
```

Now, we create a Terraform `null_resource` to apply the above policy with the script we wrote earlier. Notice that the script is called `elastic_api_call.sh` and it is located inside of the `./scripts/` subfolder, in the same folder as the Terraform files.

Notice also that we pass the variables for the script as ENV variables. Especially of note is the `AUTHORIZATION` value, this one should be a `Base64` of the `es_username:es_password` string. In the real world, we would not want to have the password in the codebase, so we plug it in from somewhere else (replacing the "pass" string below), and we use Terraform's [join](https://www.terraform.io/language/functions/join) and [base64encode](https://www.terraform.io/language/functions/base64encode) functions to create the string for us (do remember however, that the `Base64` string will be stored in your Terraform state. **Always** make sure to properly secure your state files).

Finally, the `ENDPOINT` variable should be set to the specific API endpoint we are trying to reach, while `CLUSTER_NAME` and `CLUSTER_RESOURCE_GROUP` should be set to the correct values for our Kubernetes cluster:

```terraform
resource "null_resource" "setPolicy" {
  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command     = "chmod +x ./scripts/elastic_api_call.sh && ./scripts/elastic_api_call.sh"

    environment = {
      CLUSTER_NAME           = "es-cluster"
      CLUSTER_RESOURCE_GROUP = "es-resource-group"
      AUTHORIZATION          = base64encode(join(":", ["user", "pass"]))
      HTTP_VERB              = "PUT"
      ENDPOINT               = "_ilm/policy/${var.lifecyclePolicy.name}"
      BODY_JSON              = var.lifecyclePolicy.policy
    }
  }

  triggers = {
    policy = var.lifecyclePolicy.policy
  }
}
```

Using the policy definition as a [trigger](https://registry.terraform.io/providers/hashicorp/null/latest/docs/resources/resource#optional) will ensure that the resource is run every time changes are made to it, keeping our `null_resource` idempotent. Triggers can be set to any string, so make sure to set them to a value that makes sense for your specific scenario (such as the policy definition, in this example).

## Conclusion
The script we created can be used with different combinations of endpoint/HTTP verb/body. This means that we can easily create more `null_resource`s as needed, to call different API endpoints in Elasticsearch. In this way, we can keep all our configuration in code, and keep manual work to a minimum.
