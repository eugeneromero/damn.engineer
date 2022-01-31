---
layout: post
title: Accessing Azure Key Vault secrets from Kubernetes
description: How to query and inject Azure Key Vault secrets in Kubernetes
tags: azure azure-keyvault cloud kubernetes
---

## Querying and injecting Azure Key Vault secrets into Kubernetes microservices

![Application secrets should be properly protected](https://damn.engineer/assets/images/azure-keyvault-to-kubernetes/secrets.jpg)
Photo by [FLY:D](https://unsplash.com/@flyd2069?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/padlock?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

If you use Kubernetes to run your applications, sooner or later your cluster pods will need access to **secrets**.

Of course, putting secrets in code is a [very bad idea](https://littlemaninmyhead.wordpress.com/2021/04/05/why-we-shouldnt-commit-secrets-into-source-code-repositories/). Many cyber-attacks and vulnerabilities could have been avoided if a password/API key/connection string/etc had not been committed to a code base.

On the other hand, modern applications, especially in a DevOps environment, should have all of their configuration available programmatically. Having to manually add configuration to running services would defeat the purpose of "Automating All The Things".

Nowadays, a common approach to secrets management is the use of Vaults. Vaults keep secrets safe, controlling access to them, and providing APIs for querying them. If you have any secrets in your cloud-based application, you should be storing them in a vault. All major cloud providers have vaults readily available for customers.

So, how can Kubernetes-based applications access vault secrets in a secure and automated way?

Recently, I was tasked with finding the answer to that question in my current project. After some research and testing, I found what is currently the best (only?) solution for this:

Enter [**Kubernetes Secrets Store CSI Driver**](https://secrets-store-csi-driver.sigs.k8s.io/introduction.html). Now that's a mouthful.

## Secrets Store Driver

At the most basic level, the Kubernetes Secrets Store CSI Driver (from now on, **KSSCD**) is a tool which connects to a vault, pulls one or multiple secrets from it, and makes them available inside the Kubernetes cluster. Pods can then use those secrets natively, without any additional work. If the secrets update on the Vault side, KSSCD will make those updates available in the cluster.

KSSCD is able to query secrets from many different types of vaults. For this example, I am going to use Azure Key Vault.

To accomplish this task, we need to perform the following steps:

1. <a href="#granting-ksscd-access-to-azure-key-vault">An identity needs to be created for granting KSSCD access to the vault</a>
1. <a href="#installing-ksscd">KSSCD must be installed in the cluster</a>
1. <a href="#configuring-ksscd">KSSCD must be configured to know which vault secrets to query, and which Kubernetes secret(s) to create from them</a>
1. <a href="#using-the-secrets">Pods have to be configured to use the new Kubernetes secret(s)</a>

### Granting KSSCD access to Azure Key Vault

For KSSCD to have access to the key vault, we must create a new Service Principal, or identity, give it permissions on key vault objects, and store the SP credentials as a Kubernetes secret. There are many ways of creating Service Principals, but my preferred way is by using the Azure CLI:

```bash
az ad sp create-for-rbac --name KSSCD-ServicePrincipal
```

Note down the returned `appID`, `password`, and `tenant`.

With our new SP in hand, we can now grant it `get` permissions on our key vault objects:

```bash
az keyvault set-policy -n "$KEYVAULT_NAME" \
  --secret-permissions get \
  --key-permissions get \
  --certificate-permissions get \
  --spn "$SERVICE_PRINCIPAL_APP_ID"
```

Finally, we create a Kubernetes secret to hold our Service Principal information. Note that the secret containing the credentials needs to be created in the **same namespace** as the application pod. If pods in multiple namespaces need to use the same credentials to access the key vault, this secret needs to be created in _each_ namespace:

```bash
kubectl create secret generic keyvault-credentials \
  --from-literal clientid="$SERVICE_PRINCIPAL_APP_ID" \
  --from-literal clientsecret="$SERVICE_PRINCIPAL_APP_PASSWORD"

# KSSCD requires that the secret have this specific label
kubectl label secret keyvault-credentials \
  secrets-store.csi.k8s.io/used=true
```

The credentials are now ready to be used by KSSCD.

### Installing KSSCD

It's now time to actually install KSSCD in our Kubernetes cluster. In my case, I chose to do it by means of the official Helm chart. Note that this installs the CSI Secrets Provider, and the required bits for an Azure-specific deployment:

```bash
helm repo add csi-secrets-store-provider-azure https://raw.githubusercontent.com/Azure/secrets-store-csi-driver-provider-azure/master/charts

helm install csi csi-secrets-store-provider-azure/csi-secrets-store-provider-azure --namespace kube-system
```

There are several reasons for installing KSSCD in the `kube-system` namespace, which are outlined in the [official documentation](https://azure.github.io/secrets-store-csi-driver-provider-azure/getting-started/installation/).

With KSSCD now installed, we are ready to tell it where to go looking for secrets.

### Configuring KSSCD

To configure KSSCD to make key vault secrets available locally, we must create a Kubernetes `SecretProviderClass` resource. In my experience, I prefer creating a `SecretProviderClass` for each microservice. There are a few reasons for this:

1. It is not easy to have pods in one namespace read secrets from a different namespace. Since each one of my application's microservices lives in a different namespace, it also makes sense to have a local `SecretProviderClass` create local secrets exclusive to that microservice's needs.
1. This helps avoid secrets leaking, by creating a series of small Kubernetes secrets, instead of one huge secret with everything in it.

To create a `SecretProviderClass`, the following YAML can be customized and deployed to the same namespace as the pods that will use the secrets. In this case, we will query the Azure Key Vault objects `key-vault-secret-1` and `key-vault-secret-2`, and make their values available inside the namespace in a new Kubernetes secret called `foo-secrets`:

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: azure-secrets-microservice-foo
spec:
  provider: azure
  parameters:
    keyvaultName: $KEYVAULT_NAME
    # Azure AD tenant ID. Received when we created the SP.
    tenantId: $SERVICE_PRINCIPAL_TENANT_ID
    # List of secrets to pull from the key vault 
    objects: |
      array:
        - |
          objectName: key-vault-secret-1
          objectType: secret
        - |
          objectName: key-vault-secret-2
          objectType: secret
  # The new Kubernetes secret to create
  secretObjects:
    # Name of the new Kubernetes secret
    - secretName: foo-secrets
      type: Opaque
      data:
        # A key name inside the new secret
        - key: databasepassword
          # Secret value to use
          objectName: key-vault-secret-1
        - key: clientsecret
          objectName: key-vault-secret-2
```

Note that it is possible to create multiple Kubernetes secrets under `secretObjects`, and populate them with different keys and values.

Save this file as `secret-provider-class.yaml` and deploy it to the cluster with `kubectl`:

```bash
kubectl apply -f ./secret-provider-class.yaml
```

At this point, KSSCD is configured to access Azure, but has not actually made a connection to the key vault yet. For that, we have to configure a pod to use the secrets provided by KSSCD.

### Using the secrets

Because of how KSSCD works, secrets are only queried from the key vault _when a pod attempts to mount them as a volume_. My understanding is that this is because of KSSCD being a CSI driver. Therefore, to use our secrets in a pod, we also need to make them available as volumes.

Here is a sample pod deployment, which mounts our secrets on `/mnt/secrets`, and then creates environment variables from those secrets:

```yaml
kind: Pod
apiVersion: v1
metadata:
  # The pod we are creating
  name: foo-microservice
spec:
  volumes:
    # The volume created by KSSCD. This block makes it available
    # to the pod for mounting. It can be named anything we want.
    - name: secrets-volume
      csi:
        driver: secrets-store.csi.k8s.io
        readOnly: true
        volumeAttributes:
          # Which SecretProviderClass is providing this volume?
          secretProviderClass: azure-secrets-microservice-foo
        # This is the secret with the SP credentials, which 
        # KSSCD will use to connect to the key vault 
        nodePublishSecretRef:
          name: keyvault-credentials
  containers:
    - name: busybox
      image: busybox:latest
      command:
        - "/bin/sleep"
        - "10000"
      volumeMounts:
        # Mount the above volume. This also makes our secrets
        # available as files in the pod's filesystem. Crucially,
        # this step also creates the Kubernetes secret we
        # defined in the SecretProviderClass
        - name: secrets-volume
          mountPath: "/mnt/secrets"
          readOnly: true
      env:
        - name: NON-SECRET-ENV
          value: "some value"
        # Create ENV variables from the Kubernetes secret
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: foo-secrets
              key: databasepassword
        - name: CLIENT_SECRET
          valueFrom:
            secretKeyRef:
              name: foo-secrets
              key: clientsecret
        # ENVs can be used inside of other ENVs if needed
        - name: CONNECTION_STRING_WITH_SECRET_INJECTED
          value:
            "Server=db;User ID=user;Password=$(DB_PASSWORD);"
```

Lets save this file as `pod.yaml` and deploy it to the cluster:

```bash
kubectl apply -f ./pod.yaml
```

Once the pod successfully deploys, our secrets will be available to the pod in two ways:

1. As files in the path we specified in `spec.containers.volumeMounts.mountPath`. The files will be named **the same way as the Azure Key Vault secret** (in our example, these files will be `/mnt/secrets/key-vault-secret-1` and `/mnt/secrets/key-vault-secret-2`). **All** queried secrets will be available here.
1. As environment variables. **Only secrets explicitly set up under `spec.containers.env` will be available as ENVs**.

In this way, we can choose which secrets we only need as files (certificate files for example), and which ones we want to use as environment variables.

### What happens if a secret is updated in the key vault?

KSSCD will query key vaults to check for changes from time to time. However, if a secret being used as an ENV variable is updated at the source, the pod will need to be restarted for the new ENV variables to become available to it. More information on secret rotation can be found in the [official docs](https://secrets-store-csi-driver.sigs.k8s.io/topics/secret-auto-rotation.html).

### Conclusion
The Kubernetes Secrets Store CSI Driver is a very powerful tool which can be leveraged to keep secrets and code separate. By using it in our Kubernetes clusters, our entire workflow can be automated, while maintaining security all around.

Questions? Suggestions? Reach out on [Twitter](https://twitter.com/theEugeneRomero) and let me know!
