# gatsby-source-wikipedia

Source plugin for pulling articles from wikipedia.

## Demo

https://guess-gatsby-wikipedia-demo.firebaseapp.com

## Install

`npm install gatsby-source-wikipedia`

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-wikipedia",
      options: {
        // For each query, the plugin will go to Wikipedia's API and search for the query
        // and fetch the top articles to the specified limit.
        queries: [
          {
            query: `progressive web app`,
            limit: 5,
          },
          {
            query: `cheese`,
            limit: 10,
          },
          {
            query: `developers`,
            limit: 10,
          },
        ],
      },
    },
  ],
}
```
