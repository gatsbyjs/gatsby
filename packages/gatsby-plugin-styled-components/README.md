# gatsby-plugin-styled-components

A [Gatsby](https://github.com/gatsbyjs/gatsby) plugin for
[styled-components](https://github.com/styled-components/styled-components) with
built-in server-side rendering support.

## Install

`yarn add gatsby-plugin-styled-components styled-components --save`

## How to use

Edit `gatsby-config.js`

```javascript
module.exports = {
  plugins: [`gatsby-plugin-styled-components`],
};
```

### Breaking changes history

<!-- Please keep the breaking changes list ordered with the newest change at the top -->

#### v2.0.1

`styled-components` is moved to a peer dependency. Installing the package
alongside `gatsby-plugin-styled-components` is now required. Use `yarn add styled-components --save`
