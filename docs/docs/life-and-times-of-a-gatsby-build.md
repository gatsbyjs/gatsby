---
title: Life and times of a Gatsby build
---

<!-- written at the time of commit e85278c to bootstrap/index.js and commit f8cae16 to build.js -->

This is a high-level overview about the steps in the Gatsby build process. For more detailed information about specific steps you can find information in the [Gatsby Internals](/docs/gatsby-internals) section of the docs.

Gatsby has two modes:

1. Develop - run with the `gatsby develop` command
2. Build - run with `gatsby build`

You can start Gatsby in either mode with its respective command: `gatsby develop` or `gatsby build`.

## Understanding gatsby develop

Gatsby develop is optimized for rapid feedback and extra debugging information.

Using `gatsby develop` runs a server in the background enabling useful features like hot reloading and Gatsby’s data explorer.

The output of running `gatsby develop` in a fresh install of the Gatsby default starter looks like this:

```shell
success open and validate gatsby-configs - 0.051 s
success load plugins - 0.591 s
success onPreInit - 0.015 s
success initialize cache - 0.019 s
success copy gatsby files - 0.076 s
success onPreBootstrap - 0.021 s
success source and transform nodes - 0.082 s
success Add explicit types - 0.018 s
success Add inferred types - 0.106 s
success Processing types - 0.080 s
success building schema - 0.266 s
success createPages - 0.014 s
success createPagesStatefully - 0.067 s
success onPreExtractQueries - 0.017 s
success update schema - 0.034 s
success extract queries from components - 0.222 s
success write out requires - 0.044 s
success write out redirect data - 0.014 s
success Build manifest and related icons - 0.110 s
success onPostBootstrap - 0.130 s
⠀
info bootstrap finished - 3.674 s
⠀
success run static queries - 0.057 s — 3/3 89.08 queries/second
success run page queries - 0.033 s — 5/5 347.81 queries/second
success start webpack server - 1.707 s — 1/1 6.06 pages/second
```

## Understanding gatsby build

Gatsby build is made for when you’ve added the finishing touches to your site and everything looks great. `gatsby build` creates a version of your site with optimizations like packaging up your site’s config, data, and code, and creating all the HTML that eventually gets [rehydrated](/docs/glossary#hydration) into a React app.

The output of running `gatsby build` in a fresh install of the Gatsby default starter looks like this:

```shell
success open and validate gatsby-configs - 0.062 s
success load plugins - 0.915 s
success onPreInit - 0.021 s
success delete html and css files from previous builds - 0.030 s
success initialize cache - 0.034 s
success copy gatsby files - 0.099 s
success onPreBootstrap - 0.034 s
success source and transform nodes - 0.121 s
success Add explicit types - 0.025 s
success Add inferred types - 0.144 s
success Processing types - 0.110 s
success building schema - 0.365 s
success createPages - 0.016 s
success createPagesStatefully - 0.079 s
success onPreExtractQueries - 0.025 s
success update schema - 0.041 s
success extract queries from components - 0.333 s
success write out requires - 0.020 s
success write out redirect data - 0.019 s
success Build manifest and related icons - 0.141 s
success onPostBootstrap - 0.164 s
⠀
info bootstrap finished - 6.932 s
⠀
success run static queries - 0.166 s — 3/3 20.90 queries/second
success Generating image thumbnails — 6/6 - 1.059 s
success Building production JavaScript and CSS bundles - 8.050 s
success Rewriting compilation hashes - 0.021 s
success run page queries - 0.034 s — 4/4 441.23 queries/second
success Building static HTML for pages - 0.852 s — 4/4 23.89 pages/second
info Done building in 16.143999152 sec
```

## Differences between develop and build

So what's the difference?

If you compare the outputs of the two commands, you can see that everything up until the line that says `info bootstrap finished` are the same. However, `gatsby build` runs some additional steps to prepare your site to go live after the bootstrap phase. Rather than starting a webpack dev server, image thumbnails are generated, production JavaScript and CSS bundles are created, as well as static HTML for pages.

```diff:title=develop-vs-build
success open and validate gatsby-configs - 0.051 s
success load plugins - 0.915 s
success onPreInit - 0.021 s
+ success delete html and css files from previous builds - 0.030 s
success initialize cache - 0.034 s
success copy gatsby files - 0.099 s
success onPreBootstrap - 0.034 s
success source and transform nodes - 0.121 s
success Add explicit types - 0.025 s
success Add inferred types - 0.144 s
success Processing types - 0.110 s
success building schema - 0.365 s
success createPages - 0.016 s
success createPagesStatefully - 0.079 s
success onPreExtractQueries - 0.025 s
success update schema - 0.041 s
success extract queries from components - 0.333 s
success write out requires - 0.020 s
success write out redirect data - 0.019 s
success Build manifest and related icons - 0.141 s
success onPostBootstrap - 0.130 s
⠀
info bootstrap finished - 3.674 s
⠀
success run static queries - 0.057 s — 3/3 89.08 queries/second
success run page queries - 0.033 s — 5/5 347.81 queries/second
- success start webpack server - 1.707 s — 1/1 6.06 pages/second
+ success Generating image thumbnails — 6/6 - 1.059 s
+ success Building production JavaScript and CSS bundles - 8.050 s
+ success Rewriting compilation hashes - 0.021 s
+ success Building static HTML for pages - 0.852 s — 4/4 23.89 pages/second
+ info Done building in 16.143999152 sec
```

There is also one difference in the bootstrap phase where HTML and CSS is deleted to prevent problems with previous builds.

By omitting these later steps, `gatsby develop` can speed up your ability to make edits with features like [hot module replacement](/docs/glossary#hot-module-replacement). It also saves time with the more CPU intensive processes that aren't necessary to perform while in develoment.

A cache is also used that is invalidated on every change to a `gatsby-\*.js` file (like `gatsby-node.js`, or `gatsby-config.js`) or a dependency.

## What happens when you run `gatsby build`?

To see the code where many of these processes are happening, refer to the code and comments in the [`build`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/commands/build.js) and [`bootstrap`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/bootstrap/index.js) files of the repository.

A Node process is what is powering things behind the scenes when you run the `gatsby build` command. The process of converting assets and pages into HTML that can be rendered in a browser by a [server-side](docs/glossary#server-side) language like Node.js is referred to as server-side rendering. Since Gatsby is building everything ahead of time, this creates your entire site with all of the data your pages need all at once. Then when the site is deployed, it doesn't need to be running on a server because everything has been gathered up and combined by Gatsby.

**Note**: because Gatsby apps still run React in the browser, you can still fetch data from other sources at [runtime](/docs/glossary#runtime) like you would in a normal React app

Like the console output demonstrates in the section above, there are 2 main steps that take place when you run a build:

1. the `bootstrap` phase
2. the `build` phase

To understand what happens at each step, refer to the sections below.

### Steps of the bootstrap phase

The steps of the bootstrap phase are shared between develop and build (with only one exception in the `delete html and css files from previous builds` step), and are:

1. `open and validate gatsby-configs`

The `gatsby-config` file for the site and any installed themes are opened, ensuring that a function or object is exported for each.

2. `load plugins`

Plugins installed and included in the config of your site and your site's themes are [loaded](/docs/how-plugins-apis-are-run/). Gatsby uses redux internally, and stores info like the version, name, and what APIs are used by each plugin.

3. `onPreInit`

Runs the [`onPreInit` node API](/docs/node-apis/#onPreInit) if it has been implemented by your site or any installed plugins.

4. `delete html and css files from previous builds`

The only different step between develop and build, the HTML and CSS from previous builds is deleted to prevent problems with styles and pages that no longer exist sticking around.

5. `initialize cache`

Check if new dependencies have been installed in the `package.json`, if the versions of installed plugins have changed, or if the `gatsby-config.js` or the `gatsby-node.js` files have changed.

6. `copy gatsby files`

Copies site files into the cache in the `.cache` folder.

7. `onPreBootstrap`

Calls the [`onPreBootstrap` node API](/docs/node-apis/#onPreBootstrap) in your site or plugins where it is implemented.

8. `source and transform nodes`

Creates nodes from your site and all plugins implementing the [`sourceNodes` API](/docs/node-apis/#sourceNodes), and warns about plugins that aren't creating any nodes.

9. `Add explicit types`

Adds types to the GraphQL schema for nodes that you have defined explicitly with Gatsby's [schema optimization APIs](/docs/schema-customization/#explicitly-defining-data-types).

10. `Add inferred types`

Adds types for nodes are inspected and then [inferred](/docs/schema-customization/#automatic-type-inference) by Gatsby's schema optimization APIs.

11. `Processing types`

Composes 3rd party schema types, children fields, custom resolve functions, set fields, and print type definitions into the GraphQL schema.

12. `building schema`

Imports the composed GraphQL schema and builds it.

13. `createPages`

Calls the [`createPages` API](/docs/node-apis/#createPages) for your site and all plugins implementing it, like when you [create pages programatically](/docs/programmatically-create-pages-from-data/) in your `gatsby-node.js`.

14. `createPagesStatefully`

Similar to the `createPages` step, but for the [`createPagesStatefully` API](/docs/node-apis/#createPagesStatefully).

15. `onPreExtractQueries`

Calls the [`onPreExtractQueries` API](/docs/node-apis/#onPreExtractQueries) for your site and all plugins implementing it.

16. `update schema`

Rebuilds the GraphQL schema, this time with `SitePage` context.

17. `extract queries from components`

18) `write out requires`
19) `write out redirect data`
20) `Build manifest and related icons`
21) `onPostBootstrap`

### Steps of the build phase
