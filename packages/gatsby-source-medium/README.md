# gatsby-source-medium

Source plugin for pulling data into Gatsby from an unofficial Medium JSON
endpoint. Unfortunately the JSON endpoint does not provide the complete stories,
but only previews. If you need the complete stories, you might have a look at
something like
[gatsby-source-rss](https://github.com/jondubin/gatsby-source-rss).

## Install

`npm install --save gatsby-source-medium`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-medium`,
    options: {
      username: `username/publication`,
      limit: 200,
    },
  },
]
```

### Options

#### Username

Remember that if you are fetching a user, prepend your username with `@`.

#### Limit

**Note: this only affects requests for users and not publications.**

Limit is optional and will default to 100.

You must set a higher limit if you want more than 100 posts. If you want fewer, you can either use this setting, or add a limit parameter to your graphql query.

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
