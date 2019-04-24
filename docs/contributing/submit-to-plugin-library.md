---
title: Submit to Plugin Library
---

## Publishing a plugin to the library

In order to add your plugin to the [Plugin Library](/plugins/), you need to:

1.  publish a package to npm (learn how [here](https://docs.npmjs.com/getting-started/publishing-npm-packages)),
2.  include the [required files](/docs/how-plugins-work/#what-files-does-gatsby-look-for-in-a-plugin) in your plugin code,
3.  and **include a `keywords` field** in your plugin's `package.json`, containing `gatsby` and `gatsby-plugin`.

After doing so, Algolia will take up to 12 hours to add it to the library search index (the exact time necessary is still unknown), and wait for the daily rebuild of https://gatsbyjs.org to automatically include your plugin page to the website. Then, all you have to do is share your wonderful plugin with the community!

## Notes

### Keywords

You can include other _relevant_ keywords to your `package.json` file to help interested users in finding it. As an example, a Markdown MathJax transformer would include:

```json:title=package.json
"keywords": [
  "gatsby",
  "gatsby-plugin",
  "gatsby-transformer-plugin",
  "mathjax",
  "markdown",
]
```

### Images

If you include images in your plugin repo's README, please make sure you are referencing the image using an absolute URL in order for the image to show on your plugin page.
