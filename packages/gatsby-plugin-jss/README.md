# gatsby-plugin-jss

Provide drop-in support for using the css-in-js library
[JSS](https://github.com/cssinjs/react-jss) including server rendering.

## Install

`npm install --save gatsby-plugin-jss react-jss`

## How to use

Add the plugin to your `gatsby-config.js`.

```javascript
plugins: [`gatsby-plugin-jss`]
```

Or with theme

```javascript
const theme = {
  fontSize: 16,
  fontFamily: "Roboto",
  color: "#212121",
}

plugins: [
  {
    resolve: "gatsby-plugin-jss",
    options: { theme },
  },
]
```

## Example

https://using-jss.gatsbyjs.org/
