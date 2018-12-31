---
title: Submit to Plugin Library
---

#### Publishing a plugin to the library

In order to add your plugin to the [Plugin Library](/plugins/), you need to publish a package to npm (learn how [here](https://docs.npmjs.com/getting-started/publishing-npm-packages)) with the [required files](#what-files-does-gatsby-look-for-in-a-plugin) and **include a `keywords` field** to `package.json` containing `gatsby` and `gatsby-plugin`.

After doing so, Algolia will take up to 12 hours to add it to the library search index (the exact time necessary is still unknown), and wait for the daily rebuild of https://gatsbyjs.org to automatically include your plugin page to the website. Then, all you have to do is share your wonderful plugin with the community!

**NOTE:** You can include other _relevant_ keywords to your `package.json` file to help interested users in finding it. As an example, a Markdown MathJax transformer would include:

```json:title=package.json
"keywords": [
  "gatsby",
  "gatsby-plugin",
  "gatsby-transformer-plugin",
  "mathjax",
  "markdown",
]
```
