# gatsby-transformer-react-docgen

Parses inline component-documentation using
[react-docgen](https://github.com/reactjs/react-docgen).

## Install

```
yarn add gatsby-transformer-react-docgen
```

## Usage

Add a plugin-entry to your `gatsby-config.js`

```js
module.exports = {
  // ...,
  plugins: [...`gatsby-transformer-react-docgen`],
};
```

You'll also need to include a source-plugin, such as
[gatsby-source-filesystem](https://www.npmjs.com/package/gatsby-source-filesystem),
so that the transformer has access to source data.

Note that at least one of your React Components must have PropTypes defined.

## How to query

An example _graphql_ query to get nodes:

```graphql
{
  allComponentMetadata {
    edges {
      node {
        displayName
        description
        props {
          name
          type
          required
        }
      }
    }
  }
}
```
