# gatsby-plugin-robots-txt

Provides support for writing a `robots.txt` file alongside your build with
[robots-generator](https://www.npmjs.com/package/robots-generator).

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
