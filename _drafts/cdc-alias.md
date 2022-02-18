---
layout: post
title: Bash function for quickly navigating any filesystem location
description: How to create a Bash function for navigating to, and moving around, a specific location in the filesystem
comments: true
publish-to-medium: false
tags: bash tips
---

## Creating a Bash function for navigating and autocompleting any filesystem directory

![Bash terminal]({{ site.url }}{{ site.baseurl }}/assets/images/cdc-alias/terminal.jpg)
Photo by [Gabriel Heinzer](https://unsplash.com/@6heinz3r?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/computer-terminal?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

If you are like me, and spend all day typing on a keyboard, you start looking for ways to save yourself a keystroke here and there. This quest for ultimate performance led me to try and find a way to speed up navigating into a directory in my Bash terminal.

### Why?

There are many reasons why a way for quickly navigating into a directory might make sense. For example, long (or capitalized) directory names. Say that you find yourself having to navigate to `/media/external/Code` on a regular basis, because that is where your keep your code repositories. Wouldn't it be nice to have a quick alias to get yourself there instead of having to type out the path every time?

_"But Damn Dot Engineer"_ I hear you say, _"wouldn't it be enough to create an `alias` for the `cd` command? Why write an article about this?"_

Because I have a self-imposed article quota to fill. Also, because **autocomplete**. If I create an alias such as

```bash
alias codedir="cd /media/external/Code"
```

this _will_ work for navigating to that specific directory. However, what if I want to continue navigating inside of that directory? Say for example that my desired destination is `/media/external/Code/www/mysite`. To reach that directory with the above alias, I would have to do it in two commands:

```bash
codedir
cd www/mysite
```

That is hardly useful, is it? Instead, I wanted to have a command that would work the same way as the normal `cd` command does, allowing me to use `TAB` for autocompleting paths, and for showing what is inside of a directory with a doube `TAB` press.

### The solution

In view of the above, I decided to try and find a simple solution, which would allow me quick travel to a directory, while maintaining the autocomplete functionality of the regular `cd` command.

To achieve this, all I had to do was create 