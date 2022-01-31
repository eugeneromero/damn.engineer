---
layout: post
title: Accessing multiple Azure subscriptions in a single Terraform run
description: How to access data and resources from several different Azure subscriptions in a single Terraform run
tags: azure terraform
---

## A tale of two ~~cities~~ Azure subscriptions

![One Terraform, two subscriptions](https://damn.engineer/assets/images/terraform-multiple-azure-subscriptions/highway.jpg)
Photo by [Adrian Schwarz](https://unsplash.com/@aeschwarz?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/cities?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

When infrastructure is declared as Terraform code, resources are usually only created in a single Azure subscription. It normally is best practice to keep multiple subscriptions separated in code, to prevent ending up with a large codebase which can be difficult to maintain and understand. However, there are times when it is necessary, or most logical, to create or query resources from different subscriptions. Luckily, Terraform allows us to work with two (or more) subscriptions in a single run if needed, by means of [configuration aliases](https://www.terraform.io/language/providers/configuration#alias-multiple-provider-configurations).

As an example, say we have two subscriptions, one called `main` and one `secondary`. Each of those subscriptions has its own Terraform repository and resources, including their own Azure Key Vaults. Now, imagine we need to put a newly created password into both of them, since this secret will be used by applications on both subscriptions.

### Credentials, a.k.a. Service Principals

The first thing needed will be credentials for each subscription. We could create a single Service Principal and give it access to both subscriptions, but I recommend dividing up access to reduce the attack surface if any Service Principal was compromised.

If you are already using Terraform, chances are you already have Service Principals which you use for your Terraform runs. If not, we can create two new ones, one for each subscription. I will not get into the specifics of how to do that here, and instead recommend following the [official Terraform documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/guides/service_principal_client_secret).

### Configuring Terraform to use multiple Azure providers

With our newly minted Service Principals (SPs) on hand, we can now configure Terraform to use them both.

First, we add some variables to hold the data for both subscriptions and SPs. That way, this sensitive information can be injected at runtime, for example by means of [environment variables](https://www.terraform.io/language/values/variables#environment-variables).

##### variables.tf
```terraform
# The Active Directory tenant ID.
# This one should be the same for both SPs
# and subscriptions
variable TENANT_ID { type=string }

# Data for the "main" subscription and SP
variable SUBSCRIPTION_ID_MAIN { type=string }
variable SERVICE_PRINCIPAL_ID_MAIN { type=string }
variable SERVICE_PRINCIPAL_SECRET_MAIN { type=string }

# Data for the "secondary" subscription and SP
variable SUBSCRIPTION_ID_SECONDARY { type=string }
variable SERVICE_PRINCIPAL_ID_SECONDARY { type=string }
variable SERVICE_PRINCIPAL_SECRET_SECONDARY { type=string }
```
With the variables in place, we can tell Terraform to use the [azurerm](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs) provider with two separate configurations. Notice the `alias` field in the config for the secondary subscription, which will allow us to specify when we want to use this one. **Otherwise, Terraform will default to using the block with no `alias` declared.**

We also add the [random](https://registry.terraform.io/providers/hashicorp/random/latest) provider, which we will use for creating the password we are saving to both Key Vaults:

##### config.tf
```terraform
terraform {
  required_providers {
    azurerm = {
      version = "~>2.90"
    }
    random = {
      version = "~>3.1"
    }
  }
}

# Configuration for our "main" subscription
provider "azurerm" {
  tenant_id       = var.TENANT_ID
  subscription_id = var.SUBSCRIPTION_ID_MAIN
  client_id       = var.SERVICE_PRINCIPAL_ID_MAIN
  client_secret   = var.SERVICE_PRINCIPAL_SECRET_MAIN
  features {}
}

# Configuration for the "secondary" subscription
provider "azurerm" {
  alias           = "secondary"
  tenant_id       = var.TENANT_ID
  subscription_id = var.SUBSCRIPTION_ID_SECONDARY
  client_id       = var.SERVICE_PRINCIPAL_ID_SECONDARY
  client_secret   = var.SERVICE_PRINCIPAL_SECRET_SECONDARY
  features {}
}
```
Terraform is now ready to work with both subscriptions.

### Accessing and modifying resources

With that out of the way, we can create the actual resources we need. We start by finding out data about both Key Vaults. Once again, notice the use of `provider` to query the non-default subscription:

##### data.tf
```terraform
# Query data from the default subscription
data "azurerm_key_vault" "main_key_vault" {
  name                = "kv-main"
  resource_group_name = "rg-main"
}

# Query the secondary subscription
data "azurerm_key_vault" "secondary_key_vault" {
  provider            = azurerm.secondary
  name                = "kv-secondary"
  resource_group_name = "rg-secondary"
}
```

Now that we have what we need, we can finally create the secret, and store it into both Key Vaults, using the `provider` block when appropriate:

##### shared_secret.tf

```terraform
resource "random_password" "shared_password" {
  length = 64
}

# Saving the password in the main key vault
resource "azurerm_key_vault_secret" "shared_password_main" {
  name         = "super-secret-password"
  value        = random_password.shared_password.result
  key_vault_id = data.azurerm_key_vault.main_key_vault.id
}

# And in the secondary, using the "provider" field again
resource "azurerm_key_vault_secret" "shared_password_secondary" {
  provider     = azurerm.secondary
  name         = "super-secret-password"
  value        = random_password.shared_password.result
  key_vault_id = data.azurerm_key_vault.secondary_key_vault.id
}
```

And just like that, we have created our secret and saved it to both Key Vaults. If we ever need to rotate the secret, we can just `taint` the single `random_password` resource, and Terraform will update all the Key Vaults automatically. Neat!

### Final notes

Something to keep in mind is that all of these resources will be stored in the same `terraform-state` file. Also, make sure you don't end up creating circular dependencies, where each repository needs data from resources created in the other repository. These are a few of the reasons why it is good to be mindful about only using this little trick when appropriate.
