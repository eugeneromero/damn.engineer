---
layout: post
title: Don't shave that yak!
description: Don't shave that yak, or when a 10 minute change becomes a multi-hour project
tags: tips
---

## When a 10 minute change, becomes a multi-hour project

![Someone not following the advice of this article]({{ site.url }}{{ site.baseurl }}/assets/images/dont-shave-that-yak/yak-shave.jpg)
Photo by [Samantha Hurley](https://burst.shopify.com/@lightleaksin?utm_campaign=photo_credit&amp;utm_content=Browse+Free+HD+Images+of+Bet+You+Didn%27t+Expect+To+See+A+Yak+Being+Shaved+Today&amp;utm_medium=referral&amp;utm_source=credit) on [Burst](https://burst.shopify.com/animal?utm_campaign=photo_credit&amp;utm_content=Browse+Free+HD+Images+of+Bet+You+Didn%27t+Expect+To+See+A+Yak+Being+Shaved+Today&amp;utm_medium=referral&amp;utm_source=credit)


**Note:** This article was originally published in 2019 on the [Capgemini Medium](https://medium.com/capgemini-norway/dont-shave-that-yak-872e994da32b) account, and on [kode24.no](https://www.kode24.no/guider/stick-to-your-planned-work/71207835).    

Have you ever had an experience like this?

Yesterday, I had to do a two-line code change to a single source file in our project. Literally all that had to be done was to replace a hard-coded value into a variable.

“Easy”, I thought. Lo and behold, after making the change, the CI pipeline decided it no longer wanted to run successfully.

“What gives?” I asked myself.

Looking into the issue, it seemed the pipeline fail might not be related to my change; instead, it appeared to be a mix of not having pushed any changes to the repository over the past week (so no pipeline runs had occurred in that period), and a dependency which had been updated in that time, after not having been touched by its developer in several months.

*“Ok, no problem, let's try to make this work”.*

The error message I was getting was a bit cryptic, so I went into the dependency’s GitHub page to try and figure out what was breaking. After some digging around and looking through open and closed issues on the project’s site, I realized that the developer had added support for the new version of its parent tool (Terraform), but without also accounting for backwards compatibility.

But, oh no! our pipelines run on Azure DevOps’ provided agents, which still didn't have that new version of Terraform on them! So this is why the pipe was breaking. The old version of Terraform didn’t understand the new version’s way of doing things.

*“Ok, what to do now? I suppose I could get around the old version on the agents by modifying the pipeline to download and set up the latest executable, at least until Microsoft updates their images.”*

But what other things will break with this change? This was a major version change (11 to 12), and apparently a lot of things had changed in between versions.

Oh wait, Terraform has a helper tool to tell you what things will no longer work in your code, cool. My workstation was on the same version of Terraform as the agents, so after downloading and setting up the new version in my machine, I ran the helper. This tool not only tells you what is deprecated, but will also fix things for you if possible, so lets hope there aren’t a lot of changes and… wait, all of a sudden I was sitting on a lot of modified files in my branch.

I also realized that, since Terraform does not look in subfolders, I would need to re-run this process within every subfolder as well, for example the ones where we keep our modules.

Ok, maybe I can write a script that does this, instead of manually going into every folder and running these commands. Should I use Bash or Ruby, hmm? Afterwards, I’ll have to modify the pipeline YAML so it downloads and upgrades Terraform every time it runs, and afterwards I should probably find out how often MS updates their images…

You can see where this is going.

A 10 min change of two lines, had become a multi-hour project with a modified pipeline and dozens of changed files in a pull request. And who knows what else I would have needed to do afterwards!

At this point, my colleague and I realized that this was an exercise in futility. “Why don’t we pin the library to the last-know working version, wait until MS updates their agent images, then create a task for tackling the upgrade properly?” 3 modified lines later (the original two plus a new one for pinning the dependency version), and the pipeline was happy again.

I think this classic scene from Malcolm in the Middle describes the situation perfectly:

<style>.embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style><div class='embed-container'><iframe src="https://www.youtube.com/embed/8fnfeuoh4s8" frameborder='0' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>

So what is the lesson here? [Don't Shave that Yak](https://seths.blog/2005/03/dont_shave_that/). Stick to the planned work.

If new, unexpected work appears while you’re doing planned work, don’t jump on it, however tempting it might be. If the work can be planned for later, do that. If it absolutely can’t, inform your lead first so that the work can be accounted for and planned, before performing it.

Otherwise, you might find yourself shaving a Yak, when all you wanted to do was wax your car.
