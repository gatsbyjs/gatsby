# gatsby-plugin-react-helmet

Provides drop-in support for server rendering data added with [React
Helmet](https://github.com/nfl/react-helmet).

React Helmet is a component which lets you control your document head using their
React component.

With this plugin, attributes you add in their component, e.g. title, meta attributes, etc.
will get added to the static HTML pages Gatsby builds.

## Install

`npm install --save gatsby-plugin-react-helmet`

## How to use

Just add the plugin to the plugins array in your `gatsby-config.js`

```javascript
plugins: [
  `gatsby-plugin-react-helmet`,
]
```
