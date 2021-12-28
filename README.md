# damn.engineer

Run local server:

```bash
$ bundle install
$ bundle exec jekyll build
$ bundle exec jekyll serve
```

To create new tag, create a folder in `tag/` with the name of the new one. In this folder add an `index.html` file and just add this header:
```
---
layout: tag
tag: yourNewTag
---
```
Then build again and you're ready.
