---
layout: post
title: Accessing Azure Key Vault secrets in Kubernetes
description: How to query and inject Azure Key Vault secrets in Kubernetes
tags: azure azure-keyvault cloud kubernetes
---

## Querying and injecting Azure Key Vault secrets into Kubernetes services

If you use Kubernetes to run your applications, sooner or later your cluster pods will need access to **secrets**.

Of course, putting secrets in code is a [very bad idea](https://littlemaninmyhead.wordpress.com/2021/04/05/why-we-shouldnt-commit-secrets-into-source-code-repositories/). Many cyber-attacks and vulnerabilities could have been avoided if a password/API key/connection string/etc had not been committed to a code base.

On the other hand, modern applications, especially in a DevOps environment, should have all of their configuration available programmatically. Having to manually add configuration to running services would defeat the purpose of "Automating All The Things".

Nowadays, a common approach to secrets management are vaults. Vaults keep secrets safe, controlling access to them, and providing APIs for querying them. If you have any secrets in your cloud application, you should be storing them in a vault. All big cloud providers have vaults readily available for customers.

Some time ago I was tasked with finding a way for injecting Azure Key Vault secrets into our Kubernetes microservices. After some research and testing, I found what is currently the best (only?) solution for this: Enter [**Kubernetes Secrets Store CSI Driver**](https://secrets-store-csi-driver.sigs.k8s.io/introduction.html). Now that's a mouthful.

## Secrets Store Driver

At the most basic level, Kubernetes Secrets Store CSI Driver (KSSCD) is a tool which connects to a vault, pulls one or multiple secrets from it, and makes them available inside the cluster as Kubernetes secrets. Pods can then use those Kubernetes secrets natively, without any additional work. If the secrets update on the Vault side, KSSCD will make those updates available in the cluster.

KSSCD is able to query secrets from many different types of vaults. For this example, I am going to use Azure Key Vault.

To accomplish this task, there are several steps involved:
1. <a href="#granting-ksscd-access-to-azure-key-vault">An identity needs to be created for granting KSSCD access to the vault</a>
1. <a href="#installing-ksscd">KSSCD must be installed in the cluster</a>
1. <a href="#configuring-ksscd">KSSCD must be configured to know which vault secrets to query, and which Kubernetes secret(s) to create from them</a>
1. <a href="#using-the-secrets">Pods have to be configured to use the new Kubernetes secret(s)</a>

### Granting KSSCD access to Azure Key Vault

For KSSCD to have access to the key vault, we must create a new Service Principal, or identity. This SP can then be given specific permissions to our vault secrets. There are many ways of creating Service Principals, but my preferred way is by using the Azure CLI:

```bash
az ad sp create-for-rbac --name KSSCD-ServicePrincipal
```

### Installing KSSCD

### Configuring KSSCD

### Using the secrets
