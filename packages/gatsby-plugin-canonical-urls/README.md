# gatsby-plugin-canonical-urls

Add canonical links to HTML pages Gatsby generates.

This implementation is primarily helpful for distinguishing between https/http,
www/no-www but could possibly be extended to help with when sites add multiple
paths to the same page.

## Install

`npm install --save gatsby-plugin-canonical-urls`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-canonical-urls`,
    options: {
      siteUrl: `https://www.example.com`,
    },
  },
]
```

With the above configuration, the plugin will add to the head of every HTML page
a `rel=canonical` e.g.

```html
<link rel="canonical" href="https://www.example.com/about-us/" />
```

### Adding search params

URL search parameters are **not** included in the canonical url by default. This is to prevent search bots 
penalizing a website for having duplicate content on pages when search tags are present. 

To enable search parameters being added to the canonical url, set the `search` option to `true`:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-canonical-urls`,
    options: {
      siteUrl: `https://www.example.com`,
      search: true,
    },
  },
]
```
