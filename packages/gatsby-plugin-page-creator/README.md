# gatsby-plugin-page-creator

Plugin to auto create pages using custom directory paths.

## Install

`npm install --save gatsby-plugin-page-creator`

## How to use

```javascript
// gatsby-config.js

module.exports = {
  plugins: [
    // You can have multiple instances of this plugin
    // to read source nodes from different locations on your
    // filesystem.
    //
    // The following sets up the Jekyll pattern of having multiple
    // "pages" directories in your project
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: `${__dirname}/src/pages/`,
      },
    },
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: `${__dirname}/src/data/`,
      },
    },
  ],
};
```
