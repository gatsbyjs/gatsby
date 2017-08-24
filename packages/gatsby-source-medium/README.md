# gatsby-source-medium

Source plugin for pulling data into Gatsby from unofficial Medium JSON endpoints.

## Install

`npm install --save gatsby-source-medium`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-hacker-news`,
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
