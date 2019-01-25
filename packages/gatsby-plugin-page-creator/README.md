# gatsby-plugin-page-creator

Gatsby plugin that automatically creates pages from React components in specified directories. Gatsby
includes this plugin automatically in all sites for creating pages from components in `src/pages`.

With this plugin, _any_ file that lives in the `src/pages` folder (or subfolders) will be expected to export a React Component to generate a Page. The following files are automatically excluded:

- `template-*`
- `__tests__/*`
- `*.test.jsx?`
- `*.spec.jsx?`
- `*.d.tsx?`
- `*.json`
- `*.yaml`
- `_*`
- `.*`

NOTE: also excludes `test.js` and `spec.js` (or .ts, .jsx, .tsx)

To exclude custom patterns, see [Ignoring Specific Files](#ignoring-specific-files)

## Install

`npm install --save gatsby-plugin-page-creator`

## How to use

```javascript
// gatsby-config.js

module.exports = {
  plugins: [
    // You can have multiple instances of this plugin
    // to create pages from React components in different directories.
    //
    // The following sets up the pattern of having multiple
    // "pages" directories in your project
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: `${__dirname}/src/account/pages`,
      },
    },
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: `${__dirname}/src/settings/pages`,
      },
    },
  ],
}
```

### Ignoring Specific Files

```javascript
// gatsby-config.js

module.exports = {
  plugins: [
    // The following will ignore pages like `page.example.js`, `page.js.example`
    // which match the given glob pattern `**/*.example?(.(js|ts)?(x))`
    // while still accepting the other pages like `page.js`
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: `${__dirname}/src/examples/pages`,
        ignore: {
          // See pattern syntax recognized by micromatch
          // https://www.npmjs.com/package/micromatch#matching-features
          // Example: Ignore `file.example.js`, `dir/s/file.example.tsx`
          patterns: [`**/*.example.(js|ts)?(x)`],
          // You can also use any micromatch options
          // https://www.npmjs.com/package/micromatch#optionsnocase
          // Example: Match both `file.example.js` and `file.EXAMPLE.js`
          options: { nocase: true },
        },
      },
    },
    // Another use case might be for when you want to disable
    // an index page for your optional page sources
    // For example, this will disable the `/blog` index page
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: `${__dirname}/src/indexes/pages`,
        ignore: {
          patterns: [`blog.(js|ts)?(x)`],
          // Note: This will only stop the creation of the `/blog` page!
          // To disable both the `/blog` and `/blog/post-slug` pages,
          // make a config.js which defines an `ignorePages` array
          // and then use those patterns in both this plugin
          // AND in your `createPages` function in gatsby-node.js
        },
      },
    },
  ],
}
```
