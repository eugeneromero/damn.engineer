---
layout: post
title: damn.engineer blackout postmortem
description: A postmortem on the website's blackout
comments: false
publish-to-linkedin: true
publish-to-medium: false
tags: azure
---

[TL;DR](#tldr) at the end of the post!

On October 1st, I received an email from [Uptime Robot](https://uptimerobot.com/) warning me that [damn.engineer](https://damn.engineer) was down. When I tried to access the site myself, I kept getting redirected to the site's 404 page.

This blog is hosted as a [Static Web App](https://azure.microsoft.com/en-us/products/app-service/static/#overview) on Azure. This service is pretty great, as it means that I don't have to worry about the infrastructure running the site, since Microsoft will take care of that for you. All you need to do is provide the static pages that make up your site, and Microsoft handles serving them worldwide.

However, a slight inconvenience with this service (and all other Azure services for that matter) is that it requires an _active_ Azure subscription 😅

When I logged into the Azure Portal to investigate why my Web App was not running, I discovered that my Azure account had been disabled! Here was the root of the problem. Upon further investigation, I saw that the subscription had been disabled because the **free monthly credit that I have as part of Visual Studio Enterprise had been removed from my account**.

The strangest part of this is that my VS Enterprise subscription was still valid and active. It seems that there was some technical issue which made Azure think the VS sub had been terminated, even though this was not the case. A friend who works at Microsoft told me that Microsoft had been cracking down on abuse of free Azure credits lately, so it is possible that some change around that might have affected my account by mistake (I promise I was not abusing these credits 😇). Regardless of the cause, I now had a disabled Azure subscription. The Portal kept telling me that if I wanted to resume using the sub, I would have to convert it to Pay-As-You-Go. At the same time, going into the Visual Studio Benefits page and trying to activate the Azure credits, would throw an error message indicating that the credits had already been used.

Since this seemed like it was not something I could fix myself, I created a support ticket on the Azure Portal. I explained the situation as best I could, and was contacted a day or two later by a Microsoft support technician. He helped me to find a **new, hidden subscription** that was also connected to my account. According to the information he provided, this new subscription had been created when I clicked on "Activate Azure credits" on the VS Benefits page. This was the reason why that page kept saying the credits were already in use.

The technician also told me that this new subscription would be the one receiving the credits from now on, so I would have to migrate all the resources on my old subscription to this one, since apparently the subs could not be swapped. To be able to move resources out of the old sub however, it would have to be reactivated. The tech told me he would work with the operations team to re-enable the sub for 24-48 hours, at no cost to me. Once this was done, I was able to move my resources over without much issue, and delete the old sub afterwards. I will write a future article about how to move resources between subscriptions.

And now, as promised:

## TL;DR:

### What happened?
Azure disabled my subscription because of some glitch on their part, which removed my Visual Studio Enterprise monthly Azure credits.

### Could I have prevented this in any way?
Not really, as this was a glitch on Azure's billing system. It's possible that this would not have happened on a Pay-As-You-Go subscription.

### What did I learn?
That at the end of the day, your Cloud provider has full control over your Cloud resources. As long as you are paying, everything will be running smoothly. But if for some reason your payment stops, they are quick to disable your stuff.

### Any other observations?
I noticed that even though the resources were disabled, the Static Web App redirected traffic to my [custom 404]({{ site.url }}{{ site.baseurl }}/404) page, instead of a generic "this Web App is off" page. That was unexpected, but welcome.

Also, several of you reached out to me to let me know the site was down. This was really nice of you, and actually told me that this blog does have readers 😄 So, thank you all!
