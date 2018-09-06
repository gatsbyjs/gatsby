# gatsby-plugin-subfont

[Subfont](https://github.com/Munter/subfont#readme) is a command line tool that optimizes font delivery for HTML files.

`gatsby-plugin-subfont` wraps the tool and automatically runs in your site's homepage.

## Install

`npm install --save gatsby-plugin-subfont`

If you want the ability to run font subsetting locally you'l need Python and install fonttools with this command line:

`pip install fonttools brotli zopfli`

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [`gatsby-plugin-subfont`],
}
```
