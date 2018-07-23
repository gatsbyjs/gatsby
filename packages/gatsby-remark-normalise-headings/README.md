# gatsby-remark-normalise-headings

This plugin bumps the heading depth of all headings if an `h1` is discovered.

This is useful for when remark is used in a setting where the title is pulled out of the frontmatter then manually rendered. The content writer doesn't need to worry about avoiding duplicate `h1` elements and only needs to stay internally consistent within their document.

For example:

```
title: "hello"
---
# Heading One

Content

# Heading Two

Content

## Heading Two A

Content
```

...will be transformed into...

```
title: "hello"
---
## Heading One

Content

## Heading Two

Content

### Heading Two A

Content
```

This is a sub-plugin for `gatsby-transformer-remark`. As demoed below, add this plugin to the options of `gatsby-transformer-remark`.

## Install

`npm install --save gatsby-remark-normalise-headings`

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [`gatsby-remark-normalise-headings`],
      },
    },
  ],
}
```
