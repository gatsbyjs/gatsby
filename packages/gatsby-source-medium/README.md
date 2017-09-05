# gatsby-source-medium

Source plugin for pulling data into Gatsby from an unofficial Medium JSON
endpoint. Unfortunately the JSON endpoint does not provide the complete stories,
but only previews. If you need the complete stories, you might have a look at
something like [gatsby-source-rss](https://github.com/jondubin/gatsby-source-rss).

## Install

`npm install --save gatsby-source-medium`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-medium`,
    options: {
      username: `username/publication`
    }
  }
]
```

## How to query

You can query nodes created from Medium like the following:

```graphql

query StoriesQuery {
    allMediumPost(sort: { fields: [createdAt], order: DESC }) {
      edges {
        node {
          id
          title
          creatorId
          slug
          uniqueSlug
          virtuals {
            subtitle
            previewImage {
              imageId
            }
          }
        }
      }
    }
    allMediumUser {
      edges {
        node {
          id
          name
        }
      }
    }
  }
```
