> **NOTE**: You probably don't need this plugin!
>
> Gatsby works with CSS Modules by default, no need for extra plugins. You should only use this if you already know what `babel-plugin-react-css-modules` is and want to enable it for your project.

# gatsby-plugin-react-css-modules

Transforms `styleName` to `className` using compile time CSS module resolution.
See the
[babel-plugin-react-css-modules README](https://github.com/gajus/babel-plugin-react-css-modules/blob/master/README.md)
for details.

## Install

`npm install gatsby-plugin-react-css-modules`

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
      // For all the options check babel-plugin-react-css-modules README link provided above
    },
  },
]
```

Files must be named using the pattern `filename.module.css` for Gatsby to treat
them as CSS modules. You can change this behavior using a custom webpack config
https://www.gatsbyjs.com/docs/add-custom-webpack-config/
