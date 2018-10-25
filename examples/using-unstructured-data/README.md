# Can you use Gatsby without GraphQL?

Yes!

This is a small example that loads data from the [PokéAPI](https://www.pokeapi.co/)’s REST endpoints, then creates pages (and nested pages) using [Gatsby’s `createPages` API](https://www.gatsbyjs.org/docs/node-apis/#createPages).

## What are the trade-offs?

### The upsides of using REST:

- The approach is familiar and comfortable, _especially_ if you’re new to GraphQL
- There’s no intermediate step: you fetch some data, then build pages with it

### The downsides of using REST:

- There are lots of calls required, and each nested call relies on data from the previous call; this won’t scale well
- All of the data for the page needs to be explicitly passed into the context object, which makes it a little harder to understand what data is being passed to the page component
- The relationships between items are harder to understand; we need to make three separate requests, resulting in three separate data objects that we have to manually combine in the front-end

## What would this look like querying from a GraphQL API?

Great question! There’s not a stable Pokémon GraphQL API that I’ve seen, but if there was, the query might look like this:

```jsx
const data = await graphql(`
  {
    Pokemon {
      edges {
        node {
          name
          abilities {
            name
            effect
          }
        }
      }
    }
  }
`)

// Use createPage to turn the data into pages, just like the REST version.
```

This one query accomplishes the same thing as the three different REST calls, and it shows more clearly how the data is related (e.g. each Pokémon has abilities).

## What would this look like using Gatsby's GraphQL integration layer?

For quick and easy comparison, the [using-gatsby-data-layer](https://github.com/jlengstorf/gatsby-with-unstructured-data/tree/using-gatsby-data-layer) branch of the original example repo illustrates how you can accomplish this using Gatsby's integration layer, rather than using the unstructured data approach.
