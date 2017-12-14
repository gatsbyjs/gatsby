# gatsby-plugin-client-only-paths

Use this plugin when creating a “hybrid” Gatsby app with both statically
rendered pages as well as "client-only paths". These paths exist exist on the
client only and do not correspond to `index.html` files in an app's built
assets.

## Usage

Install:

```
yarn add gatsby-plugin-client-only-paths
```

Then configure via `gatsby-config.js`:

```
    {
      resolve: `gatsby-plugin-client-only-paths`,
      options: { prefixes: [`/app/*`] },
    },
```

In ths example, all paths prefixed by `/app/` will render the route described in
`src/pages/app/index.js`.
