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

#### Shorthand

```javascript
// The following example will disable the `/blog` index page
// Note: This will only stop the creation of the `/blog` page!
// To disable both the `/blog` and `/blog/post-slug` pages,
// make a config.js which defines an `ignorePages` array
// and then use those patterns in both this plugin
// AND in your `createPages` function in gatsby-node.js

// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: `${__dirname}/src/indexes/pages`,
        ignore: [`blog.(js|ts)?(x)`],
        // See pattern syntax recognized by micromatch
        // https://www.npmjs.com/package/micromatch#matching-features
      },
    },
  ],
}
```

#### Ignore Options

```javascript
// The following example will ignore pages using case-insensitive matching

// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: `${__dirname}/src/examples/pages`,
        ignore: {
          // Example: Ignore `file.example.js`, `dir/s/file.example.tsx`
          patterns: [`**/*.example.(js|ts)?(x)`],
          // Example: Match both `file.example.js` and `file.EXAMPLE.js`
          options: { nocase: true },
          // See all available micromatch options
          // https://www.npmjs.com/package/micromatch#optionsnocase
        },
      },
    },
  ],
}
```
