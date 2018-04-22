[![NPM version](https://img.shields.io/npm/v/gatsby-plugin-robots-txt.svg)](https://www.npmjs.org/package/gatsby-plugin-robots-txt)
[![Travis build status](https://img.shields.io/travis/mdreizin/gatsby-plugin-robots-txt/master.svg)](https://travis-ci.org/mdreizin/gatsby-plugin-robots-txt)
[![AppVeyor build status](https://img.shields.io/appveyor/ci/mdreizin/gatsby-plugin-robots-txt/master.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMGMxMSAwIDIwIDkgMjAgMjBzLTkgMjAtMjAgMjBTMCAzMSAwIDIwIDkgMCAyMCAwem00LjkgMjMuOWMyLjItMi44IDEuOS02LjgtLjktOC45LTIuNy0yLjEtNi43LTEuNi05IDEuMi0yLjIgMi44LTEuOSA2LjguOSA4LjkgMi44IDIuMSA2LjggMS42IDktMS4yem0tMTAuNyAxM2MxLjIuNSAzLjggMSA1LjEgMUwyOCAyNS4zYzIuOC00LjIgMi4xLTkuOS0xLjgtMTMtMy41LTIuOC04LjQtMi43LTExLjkgMEwyLjIgMjEuNmMuMyAzLjIgMS4yIDQuOCAxLjIgNC45bDYuOS03LjVjLS41IDMuMy43IDYuNyAzLjUgOC44IDIuNCAxLjkgNS4zIDIuNCA4LjEgMS44bC03LjcgNy4zeiIgZmlsbD0iI0NDQyIgZmlsbC1ydWxlPSJub256ZXJvIi8%2BPC9zdmc%2B)](https://ci.appveyor.com/project/mdreizin/gatsby-plugin-robots-txt/branch/master)
[![Dependency Status](https://img.shields.io/david/mdreizin/gatsby-plugin-robots-txt.svg)](https://david-dm.org/mdreizin/gatsby-plugin-robots-txt)
[![Development Dependency Status](https://img.shields.io/david/dev/mdreizin/gatsby-plugin-robots-txt.svg)](https://david-dm.org/mdreizin/gatsby-plugin-robots-txt#info=devDependencies)

# gatsby-plugin-robots-txt

> Create `robots.txt` for your Gatsby site.

## Install

`yarn add gatsby-plugin-robots-txt`

or

`npm install --save gatsby-plugin-robots-txt`

## How to Use

`gatsby-config.js`

```js
module.exports = {
  siteMetadata: {
    siteUrl: 'https://www.example.com'
  },
  plugins: ['gatsby-plugin-robots-txt']
};
```

## Options

By default this plugin detects the following options:

|   Name    |    Type    |                Default                |      Description       |
| :-------: | :--------: | :-----------------------------------: | :--------------------: |
|  `host`   |  `String`  |       `${siteMetadata.siteUrl}`       |   Host of your site    |
| `sitemap` |  `String`  | `${siteMetadata.siteUrl}/sitemap.xml` | Path to `sitemap.xml`  |
| `policy`  | `Policy[]` |                 `[]`                  | List of `Policy` rules |

Under `Policy` you can specify any allowed [rules](http://www.robotstxt.org/orig.html#format):

```js
{
  userAgent: '*',
  allow: '/'
}
```

### Netlify

If you would like to disable crawlers for [deploy-previews](https://www.netlify.com/blog/2016/07/20/introducing-deploy-previews-in-netlify/) you can use the following snippet:

`gatsby-config.js`

```js
const sitePreviewUrl = process.env.DEPLOY_PRIME_URL;

module.exports = {
  siteMetadata: {
    siteUrl: 'https://www.example.com'
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-robots-txt',
      options:
        typeof sitePreviewUrl !== 'undefined'
          ? { policy: [{ userAgent: '*', disallow: ['/'] }] }
          : { policy: [{ userAgent: '*' }] }
    }
  ]
};
```
