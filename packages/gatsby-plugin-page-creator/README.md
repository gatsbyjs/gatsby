# gatsby-plugin-page-creator

Plugin for creating `File` nodes from the file system. The various "transformer"
plugins transform `File` nodes into various other types of data e.g.
`gatsby-transformer-json` transforms JSON files into JSON data nodes and
`gatsby-transformer-remark` transforms markdown files into `MarkdownRemark`
nodes from which you can query an HTML representation of the markdown.

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
