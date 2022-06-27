# gatsby-plugin-create-client-paths

**Please Note:** With recent versions of Gatsby this plugin became obsolete. See [migration](#migration) notes below, or refer to the [File System Route API](https://www.gatsbyjs.com/docs/reference/routing/file-system-route-api/#creating-client-only-routes) documentation for details on how client only routes are now handled.

Use this plugin to simplify creating a “hybrid” Gatsby app with both statically rendered pages as well as "client-paths". These paths exist on the client only and do not correspond to index.html files in an app's built assets.

For more information refer to [client-only routes & user authentication](https://www.gatsbyjs.com/docs/client-only-routes-and-user-authentication/).

## Migration

Extending from the use case below where the `gatsby-plugin-create-client-paths` plugin has a prefix of `/app/*`, the way you would do this with the [File System Route API](https://www.gatsbyjs.com/docs/reference/routing/file-system-route-api/#creating-client-only-routes) is by adopting this structure in your project:

```text
|-- /src
  |-- /pages
    |-- /app
      |-- [...].js
```

Additionally, you can also refer to the [client-only-paths](https://github.com/gatsbyjs/gatsby/tree/master/examples/client-only-paths) example.

## Usage

Install:

```shell
npm install gatsby-plugin-create-client-paths
```

Then configure via `gatsby-config.js`:

```js
    {
      resolve: `gatsby-plugin-create-client-paths`,
      options: { prefixes: [`/app/*`] },
    },
```

In this example, all paths prefixed by `/app/` will render the route described
in `src/pages/app.js`.
