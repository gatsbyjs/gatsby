# gatsby-plugin-catch-links

This plugin intercepts all local links that have not been created in React using [`gatsby-link`](https://gatsbyjs.org/docs/gatsby-link), and replaces their behavior with that of the `gatsby-link` [`navigate`](https://gatsbyjs.org/docs/gatsby-link/#programmatic-navigation). This avoids the browser having to refresh the whole page when navigating between local pages, preserving the Single Page Application (SPA) feel.

Example use cases:

- A markdown file with relative links (transformed
  to `a` tags by
  [`gatsby-transformer-remark`](/packages/gatsby-transformer-remark/))
- An `a` tag that has been created by a Content Management System (CMS) WYSIWYG editor

## Installation

```
npm install --save gatsby-plugin-catch-links
```

## How to use

```javascript
// In your gatsby-config.js
plugins: [`gatsby-plugin-catch-links`]
```

## Plugin Options

**`excludePattern`** [Regular Expression][optional]

Regular expression for paths to be excluded from being handled by this plugin.

```javascript
{
  resolve: `gatsby-plugin-catch-links`,
  options: {
    excludePattern: /(excluded-link|external)/,
  },
},
```

## Examples

- Check out this live example [_Using Remark_](https://using-remark.gatsbyjs.org/copy-linked-files-intercepting-local-links/#intercepting-local-links) to see this plugin in action. The full source code for this example can be found [here](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-remark).
