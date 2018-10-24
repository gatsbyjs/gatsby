# gatsby-plugin-page-creator

Gatsby plugin that automatically creates pages from React components in specified directories. Gatsby
includes this plugin automatically in all sites for creating pages from components in `src/pages`.

With this plugin, *any* file that lives in the `src/pages` folder (or subfolders) will be expected to export a React Component to generate a Page. The following files are automatically excluded:

- `template-*`
- `__tests__/*`
- `*.test.jsx?`
- `*.spec.jsx?`
- `*.d.tsx?`
- `*.json`
- `*.yaml`
- `_*`
- `.*`

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
