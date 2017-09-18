# gatsby-plugin-react-css-modules
Transforms `styleName` to `className` using compile time CSS module resolution. See the [babel-plugin-react-css-modules README](https://github.com/gajus/babel-plugin-react-css-modules/blob/master/README.md) for details.

## Install
`yarn add gatsby-plugin-react-css-modules`

## How to use
```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-react-css-modules`,
    options: {
      // *.css files are included by default.
      // To support another syntax (e.g. SCSS),
      // add `postcss-scss` to your project's devDependencies
      // and add the following option here:
      filetypes: {
        ".scss": { syntax: `postcss-scss` },
      },

      // Exclude global styles from the plugin using a RegExp:
      exclude: `\/global\/`,
    },
  },
]
```
Files must be named `filename.module.css` for Gatsby to read them as CSS modules. Or you can set up a custom webpack config to use css modules. https://www.gatsbyjs.org/docs/add-custom-webpack-config/
