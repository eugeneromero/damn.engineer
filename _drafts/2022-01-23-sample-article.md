---
layout: post
title: A sample article
description: Just testing
tags: azure terraform
---

## A tale of two ~~cities~~ Azure subscriptions

When infrastructure is declared as Terraform code, resources are usually only created in a single Azure subscription. It normally is best practice to keep multiple subscriptions separated in code, to prevent ending up with a large codebase which can be difficult to maintain and understand. However, there are times when it is necessary, or most logical, to create or query resources from different subscriptions. Luckily, Terraform allows us to work with two (or more) subscriptions in a single run if needed, by means of [configuration aliases](https://www.terraform.io/language/providers/configuration#alias-multiple-provider-configurations).
