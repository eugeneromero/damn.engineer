---
layout: post
title: Accessing Azure Key Vault secrets in Kubernetes
description: How to query and inject Azure Key Vault secrets in Kubernetes
tags: azure kubernetes azure-keyvault
---

# The problem 

If you are using Kubernetes to run your applications, sooner or later you will face a situation where a pod running inside your cluster needs access to **secrets**.

Of course, as we all know, putting secrets in code is a [very bad idea](https://littlemaninmyhead.wordpress.com/2021/04/05/why-we-shouldnt-commit-secrets-into-source-code-repositories/). There have been many 

Thankfully, there is a solution which allows to query secrets from a Vault and provide them to our Kubernetes pods securely. Enter [**Kubernetes Secrets Store CSI Driver**](https://secrets-store-csi-driver.sigs.k8s.io/introduction.html). Now that's a mouthful.

# Secrets Store Driver

At the most basic level, Kubernetes Secrets Store CSI Driver (KSSCD) is a tool which connects to a Vault, pulls one or multiple secrets from it, and makes them available inside the cluster as Kubernetes secrets. Pods can then use those Kubernetes secrets natively, without any additional work. If the secrets update on the Vault side, KSSCD will make those updates available in the cluster.

To accomplish this task, there are several steps involved:
1. Access to the Vault must be granted
1. KSSCD must be explicitly told which secrets to query
1. A Kubernetes secret needs to be created and configured
