---
layout: post
title: Enabling case insensitive completion in ZSH
description: How to enable case insensitive navigation in ZSH (Linux and MacOS)
comments: true
publish-to-linkedin: true
publish-to-medium: false
tags: tips macos zsh
---

ZSH has been the default shell in MacOS since 2019. I recently started using a Mac again, after being away from the ecosystem for a couple years. While trying to become familiar with this new shell, I found out that there is a way to enable case-insensitive navigation in the shell. This means that, when using Tab to autocomplete directory or file names, ZSH will offer all matching options, regardless of casing.

For example, say we have the following content inside a directory:
```bash
$ ls
Code/	Documents/	Music/  CAD_info.doc call.mp3
```

Without case-insensitive completion (the default), typing `ls c` and pressing Tab would give us the following options:
```bash
$ ls c
call.mp3
```

However, with case-insensitive completion enabled, ZSH will return all files and directories starting with C:
```bash
$ ls c
Code/   CAD_info.doc    call.mp3
```

To enable this functionality, add the following snippet to the end of your `~/.zshrc` file (or create one if it does not exist):
``` zsh
autoload -Uz +X compinit && compinit

## case insensitive path-completion
zstyle ':completion:*' matcher-list 'm:{a-zA-Z}={A-Za-z}'
zstyle ':completion:*' menu select
```

Next time you open ZSH, the functionality will be enabled. If you wish to enable it in the running terminal, you can also run `source ~/.zshrc`.
