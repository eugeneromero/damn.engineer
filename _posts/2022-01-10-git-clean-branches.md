---
layout: post
title: Bash alias for cleaning git branches
description: How to create a Bash alias for quickly cleaning out stale git branches
comments: true
publish-to-linkedin: true
publish-to-medium: true
tags: bash tips
---

## Tired of hunting for stale git branches?

![Git branches]({{ site.url }}{{ site.baseurl }}/assets/images/git-clean-branches/git-branches.jpg)
Photo by [Yancy Min](https://unsplash.com/@yancymin?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

As a `git` user, I got tired of constantly seeing my list of branches grow out of control. Git is great for keeping the history of a repository, but at least for me, there isn't a lot of value in keeping deleted branches in my local history. Besides, if you are using [short-lived feature branches](https://trunkbaseddevelopment.com/short-lived-feature-branches/) (and you _really_ should be), you will be creating and deleting several new branches per week.

Because of this, I decided to create an alias to remove old branches from my local machine. My criteria was:

1. Only branches which have been merged to master should be deleted
1. My local list of remote branches should be cleaned up, to remove non-existing branches

With that criteria in mind, I came up with the following steps:

## The solution

First, return a list of all local branches which have already been merged to master. Crucially, this does not include any branches with commits **different** from master:

```bash
git branch --merged master
```

This list also includes the local `master` branch, as well as the currently checked out branch (denoted by a `*`). This grep removes that:

```bash
grep -v -e 'master' -e '\*'
```

Finally, delete all remaining results. The lowercase `-d` flag also ensures only fully merged branches get deleted (as opposed to the delete all `-D`):

```bash
xargs -n 1 git branch -d
```

Afterwards, do a prune of the local copy of remote, to remove any references to non-existing remote branches:

```bash
git remote prune origin
```

Putting it all together, I ended up with this alias, which I then added to my `.bashrc` file:

## The TL;DR

**git-clean-branches:**

```bash
alias git-clean-branches="git branch --merged master | grep -v -e 'master' -e '\*' | xargs -n 1 git branch -d && git remote prune origin || echo 'No local branches to remove, so nothing done.'"
```

Now, my clean-up ritual after completing a pull request is always the following:

```bash
gcm # this is an alias for "git checkout master"
git pull # grab the latest master
git-clean-branches # clean up all merged local branches and prune my local list of remote branches
```

Automate all the things!
