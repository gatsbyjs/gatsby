# gatsby-plugin-robots-txt

Provides support for writing a `robots.txt` file alongside your build with
[robots-generator](https://www.npmjs.com/package/robots-generator).

React Helmet is a component which lets you control your document head using
their React component.

With this plugin, attributes you add in their component, e.g. title, meta
attributes, etc. will get added to the static HTML pages Gatsby builds.

## Install

`npm install --save gatsby-plugin-robots-generator`

## How to use

Simply pass along configuration for `robots-generator` to the `options`
specified in your `gatsby-config.js` Just add the plugin to the plugins array in
your `gatsby-config.js`

```javascript
module.exports = {
  ...,
  plugins: [
    ...,
    {
      resolve: `gatsby-plugin-robots-txt`,
      options: {
        useragent: '*',
        sitemap: 'https://gatsbyjs.org/sitemap.xml'
      }
    }
  ],
}
```
