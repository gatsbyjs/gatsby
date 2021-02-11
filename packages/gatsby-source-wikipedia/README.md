# gatsby-source-wikipedia

Source plugin for pulling articles from wikipedia.

## Demo

https://guess-gatsby-wikipedia-demo.firebaseapp.com

## Install

`npm install gatsby-source-wikipedia`

## How to use

With the language option you can get the article from different countries. Wikipedia has articles in many languages and most articles have a translation as well. 
For instance: This the English page for Justin Bieber https://en.wikipedia.org/wiki/Justin_Bieber, but the page also exists for any other language. 
- https://de.wikipedia.org/wiki/Justin_Bieber
- https://fr.wikipedia.org/wiki/Justin_Bieber
- https://nl.wikipedia.org/wiki/Justin_Bieber

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
            lang: 'en',
          },
          {
            query: `cheese`,
            limit: 10,
            lang: 'en'
          },
          {
            query: `developers`,
            limit: 10,
            lang: 'en'
          },
          {
            query: `kaas`,
            limit: 10, 
            lang: 'nl'
          }, 
          {
            query: `fromage`,
            limit: 10, 
            lang: 'fr'
          }, 
          {
            query: `sauerkraut`,
            limit: 10, 
            lang: 'de'
          }, 
        ],
      },
    },
  ],
}
```
