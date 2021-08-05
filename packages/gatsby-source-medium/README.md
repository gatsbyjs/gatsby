# gatsby-source-medium

Source plugin for pulling data into Gatsby from an unofficial Medium JSON
endpoint. Unfortunately the JSON endpoint does not provide the complete stories, but only previews. And due to a limitation placed by Medium, only the most recent 10 posts are returned. If you need the complete stories, you might have a look at something like
[gatsby-source-rss](https://github.com/jondubin/gatsby-source-rss).

## Install

`npm install gatsby-source-medium`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-medium`,
    options: {
      username: `username/publication`,
    },
  },
]
```

### Options

#### Username

Remember that if you are fetching a user, prepend your username with `@`.

## How to query

Get all posts with the preview image ID and the author's name:

```graphql
query {
  allMediumPost(sort: { fields: [createdAt], order: DESC }) {
    edges {
      node {
        id
        title
        virtuals {
          subtitle
          previewImage {
            imageId
          }
        }
        author {
          name
        }
      }
    }
  }
}
```

Get all users with their posts:

```graphql
query {
  allMediumUser {
    edges {
      node {
        name
        posts {
          title
        }
      }
    }
  }
}
```
