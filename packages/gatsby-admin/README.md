# Gatsby Admin

A visual interface to configure your Gatsby site.

We have not packaged this nicely yet, so it is not installable.

## How to develop it

However, you can do some manual set up in order to work with it locally. Follow these steps:

1. Navigate to the monorepo and open the `packages/gatsby-admin` directory.
2. In that directory, run `yarn develop`.
   > If you see eslint errors you'll need to temporarily replace all references to `___loader` with `window.___loader` inside of `gatsby-link/index.js`.
3. In a new tab, navigate to a Gatsby site of your choice (or create one) that runs the latest version of Gatsby (recipes are a requirement).
4. From the `packages/gatsby-recipes/src` directory in the monorepo copy the `create-types.js` and `graphql.js` files. Use these files to replace those currently in your site's `node_modules/gatsby-recipes/src` directory.
5. Run `node ./node_modules/gatsby-recipes/src/graphql.js` to start the Recipes GraphQL server for that site.

You should now be able to visit `localhost:8000` to see Gatsby Admin for that site!
