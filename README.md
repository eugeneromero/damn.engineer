[![Publish Jekyll site](https://github.com/eugeneromero/damn.engineer/actions/workflows/jekyll-publish.yml/badge.svg?branch=master)](https://github.com/eugeneromero/damn.engineer/actions/workflows/jekyll-publish.yml)

# damn.engineer

Some information on creating content:

## New post
To create a local draft, create a new file inside the `_drafts/` folder, with no date on the title. To preview, run local server:

```bash
# first time only
$ bundle install

$ bundle exec jekyll server -lo --draft
```

To publish the post, move it to the `_posts/` folder, and add the publish date to the title, like so: `YYYY-MM-DD-title.md`. When the repository is pushed to GitHub, the post will be published if the pipeline passes succesfully.

## Tags
To create a new tag, create a folder in `tag/` with the new name. In this folder add an `index.html` file and just add this header:
```
---
layout: tag
tag: yourNewTag
---
```
The tag will be available instantly.
