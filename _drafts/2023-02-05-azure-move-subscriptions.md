---
layout: post
title: Moving resources between subscriptions in Azure
description: How to move resources from one subscription to another in Azure
comments: true
publish-to-linkedin: true
publish-to-medium: false
tags: azure
---

## Migrating (single or multiple) resources between Azure subscriptions

![Moving day]({{ site.url }}{{ site.baseurl }}/assets/images/azure-move-subscriptions/moving.jpg)
Photo by [Jiawei Zhao](https://unsplash.com/@jiaweizhao?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/photos/W-ypTC6R7_k?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Occasionally, you might need to move resources from one Azure subscription to another. This could be related to cost, keeping things organized, dividing resources by type or environment, etc. In my case, I found myself in need of migrating all of my Azure resources when Azure unexpectedly [shut my old subscription down]({{ site.url }}{{ site.baseurl }}/2022/10/20/postmortem).

When I was notified that my subscription had been deactivated, I had worried that I would need to recreate all resources from scratch in a new subscription. Thankfully, this was not the case. I discussed the issue I was having with my friend [Niall Merrigan](https://twitter.com/nmerrigan), and he showed me that it was indeed possible to move things between subscriptions, instead of needing to destroy and recreate them.

## Before you begin

I recommend reading through all of the following before attempting a move, since there are a few caveats to be aware of.

## Source and destination

First off, you can only perform this process with **active** subscriptions. If you want to move things out of a deactivated subscription, you will need to get it reactivated first. In my case, after a few emails with Azure Support, they re-enabled my subscription for 48 hours so that I could perform the move. If you do not do this, you will not be able to do anything with the resources there.

Additionally, you can only move between subscriptions that are in the same Active Directory tenant. Moving resources to a sub in a different tenant is unfortunately not possible.

### Check if the resource can be moved

Not every resource in Azure can be moved across subscriptions. Check [this list from Microsoft ](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/move-support-resources) to see if your desired resources are supported.

If you don't want to look through the list or are not sure about what type a specific resource is, Azure will let you know before attempting the move if the resource can be moved or not.

### Make your subscriptions easily identifiable

This is not a requirement, but it's a good tip that will probably make your life a little easier. Before you start shuffling resources around, I advise you rename your subscriptions so that you can easily tell which is which. There will be places where you can only pick a subscription by name, so if you have a few of them named the same, it will be harder to pick the correct one.

Renaming a subscription can be done in the Azure Portal by going to the Subscriptions pane, choosing the desired sub, and using the Rename button:

![Renaming subscriptions]({{ site.url }}{{ site.baseurl }}/assets/images/azure-move-subscriptions/1.jpg)

Once this is done, your subscriptions will be easily identifiable, which will simplify the process:

![Subscription list]({{ site.url }}{{ site.baseurl }}/assets/images/azure-move-subscriptions/2.jpg)

### Resource groups

To move resources, you will need to have an already existing resource group for them to go into in the target subscription. This is a good opportunity to establish a system for organizing your resources, if you don't have one in place. Alternatively, you can just recreate your resource groups from the old subscription (group names only need to be unique inside each individual sub).

### Dependencies

You will not be able to move resources that have child dependencies independently from each other. All resources that have dependencies need to be moved at the same time as said dependencies. This means that you will need to put all of these resources together in the same resource group if they aren't already. Once they are moved to the new sub, they can be reorganized there as needed.

For example, imagine I have a virtual machine attached to a virtual network in my old sub, and they are in separate resource groups. Before migrating them, I would have to move these resources into the same resource group in the old subscription. After migrating them to a resource group in the destination sub, I can then put them in different groups in the new subscription.

## The move

Once you are ready to perform the move, the process itself is quite simple. Go into the resource group containing the desired resources. Select the ones you wish to move, and choose `...` -> `Move` -> `Move to another subscription`.

![Moving process]({{ site.url }}{{ site.baseurl }}/assets/images/azure-move-subscriptions/3.jpg)

After inputting the desired destination sub and resource group, Azure will perform a check to see if the resources can be moved. If they can't, Azure will show you a message letting you know why. After pressing "Move" and waiting a few minutes, the resources will appear in the new subscription.

## Additional info
More information and details about specific scenarios can be found in the [official Microsoft docs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/move-resource-group-and-subscription).
