# gatsby-source-hacker-news

Source plugin for pulling data into Gatsby from the
[Hacker News API](https://github.com/HackerNews/API)

## Install

`npm install --save gatsby-source-hacker-news`

## How to use

```javascript
// In your gatsby-config.js
plugins: [`gatsby-source-hacker-news`];
```

## How to query

You can query nodes created from Hacker News like the following:

```graphql
query StoriesQuery {
  allHnStory(sort: { fields: [order] }) {
    edges {
      node {
        id
        title
        score
        order
        domain
        url
        by
        descendants
        timeISO(fromNow: true)
        children {
          id
          text
          timeISO(fromNow: true)
          by
        }
      }
    }
  }
}
```
