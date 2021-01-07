---
title: How Shadowing Works
---

Shadowing is a powerful feature that allows theme users to override components, objects, and anything else in a theme's `src` directory.

> **Note** This is a technical deep dive into how Shadowing works. If you'd
> like to learn about what Shadowing is, see the [What is Component Shadowing?](/blog/2019-04-29-component-shadowing/)
> blog post.

Shadowing works by using a [webpack resolver plugin](https://webpack.js.org/api/resolvers/) that maps themes in a `gatsby-config.js` to possible shadowed files. This gets especially mind melty because themes can add parent themes to a configuration so you need to be able to walk the composition of themes to determine the "last shadow" since the last shadowed theme file wins in the algorithm.

## Theme Composition

It's important to begin discussing how the composition of themes works. An end user of a theme can configure any number of themes. Each of these themes are considered sibling themes. Here is a `gatsby-config.js` that configures two sibling themes:

```js:title=gatsby-config.js
module.exports = {
  plugins: ["gatsby-theme-tomato-blog", "gatsby-theme-tomato-portfolio"],
}
```

Both of the themes above (blog and portfolio) can install and configure any other theme so you end up with a tree of themes which we call a theme composition.

The theme composition itself has a few properties:

- the last theme wins
- a theme that uses another theme is the child theme
- a theme that is used by another theme is the parent theme
- theme trees are flattened during resolution

These characteristics are used in the component shadowing algorithm to decide which component to render. So, for example, if `gatsby-theme-tomato-blog` has `gatsby-theme-parent` as a parent theme it results in the following themes array:

```js
const themesArray = [
  "gatsby-theme-parent",
  "gatsby-theme-tomato-blog",
  "gatsby-theme-tomato-portfolio",
]
```

This means that `gatsby-theme-tomato-portfolio` receives priority for component resolution, because it is last in the array.

## Modifying the webpack Config

Component shadowing is a bit meta because it is implemented as an internal Gatsby plugin that applies a webpack plugin which modifies how module resolution happens for files that are shadowed.

The plugin consists of a `gatsby-node.js` and the webpack plugin code.
The `gatsby-node` file is pretty straightforward:

```js
const GatsbyThemeComponentShadowingResolverPlugin = require(`.`)

exports.onCreateWebpackConfig = (
  { store, stage, getConfig, rules, loaders, actions },
  pluginOptions
) => {
  const { themes, flattenedPlugins } = store.getState()

  actions.setWebpackConfig({
    resolve: {
      plugins: [
        new GatsbyThemeComponentShadowingResolverPlugin({
          themes: themes.themes
            ? themes.themes
            : flattenedPlugins.map(plugin => {
                return {
                  themeDir: plugin.pluginFilepath,
                  themeName: plugin.name,
                }
              }),
        }),
      ],
    },
  })
}
```

We first check for themes in the Redux store. This is for backwards-compatibility since themes are now merged with plugins. If the `themes` key was used in the user's `gatsby-config.js` those are passed to the shadowing resolver plugin. Otherwise, the flattened plugin list is passed.

## Structure of a webpack Plugin

The webpack plugin itself has a constructor and an apply function which webpack calls as part of module resolution. We tie into the "relative" hook in [the pipeline](https://github.com/webpack/enhanced-resolve/blob/5c1495a947060cf11106abc325b8adf1a0eff9b1/lib/ResolverFactory.js#L158).

```js:title=packages/gatsby/src/internal-plugins/webpack-theme-component-shadowing/index.js
module.exports = class GatsbyThemeComponentShadowingResolverPlugin {
  constructor({ projectRoot, themes }) {
    this.themes = themes
    this.projectRoot = projectRoot
  }

  apply(resolver) {
    resolver.plugin(`relative`, (request, callback) => {
      // highlight-line
      // ...
    })
  }
}
```

### Get matching themes

The `request` contains the path of the file which we want to use to find potential matches in themes.

```js
resolver.plugin(`relative`, (request, callback) => {
  const matchingThemes = this.getMatchingThemesForPath(request.path)
})
```

Which is defined on the class:

```js
module.exports = class GatsbyThemeComponentShadowingResolverPlugin {
  // ...

  getMatchingThemesForPath(filepath) {
    // find out which theme's src/components dir we're requiring from
    const allMatchingThemes = this.themes.filter(({ themeName }) =>
      filepath.includes(path.join(themeName, `src`))
    )

    // The same theme can be included twice in the themes list causing multiple
    // matches. This case should only be counted as a single match for that theme.
    return _.uniq(allMatchingThemes.map(({ themeName }) => themeName))
  }

  // ...
}
```

This is run for all files in the site bundle and checks for potential matches. So, if a request is `/some/path/my-site/gatsby-theme-tomato/src/button/heading.js` and `gatsby-theme-tomato` is installed on the site, we'll return `gatsby-theme-tomato`.

We perform this match so that we can determine the theme that is being required from so we can check for shadowed files in the user's site or other themes to match against. We also make sure the matched themes are unique because two themes can bring in the same theme to the theme composition. When that's the case we won't worry about them being different. Though, it is important to note that when performing resolution to build the site, the last theme added will always win.

#### Handle too many matches

Next, we check to make sure that if there is more than one matching theme there is some sort of ambiguity and we should return an error. This can happen if there's a path like `gatsby-theme-blog/src/components/gatsby-theme-something/src/components` in the project.

#### No matches

If there are no theme matches we return the invoked callback because there's nothing more to do, time to let webpack continue on it's way with module resolution.

```js
if (matchingThemes.length === 0) {
  return callback()
}
```

### The matched theme

Now, if we still haven't returned the callback or thrown an error (due to ambiguity) it means we have a file being required from a theme. The file being required will look something like `/some/path/my-site/gatsby-theme-tomato/src/box` and so the first thing we want to do is get the relative path for the file within the theme's `src` directory:

```js
const [theme] = matchingThemes
const [, component] = request.path.split(path.join(theme, `src`))
```

So, with the example path above we'll end up with `/box`. This can then be used to see if the user's site or any other themes are shadowing the file.

### The component shadow

Since a file from a theme is being required we need to figure out which path should be resolved for the requested component. We do this by calling `resolveComponentPath` which uses the theming algorithm to attempt to find a shadowed component. If nothing is found we return the original request which points at the original theme's component.

```js
const builtComponentPath = this.resolveComponentPath({
  matchingTheme: theme,
  themes: this.themes,
  component,
})

return resolver.doResolve(
  `describedRelative`,
  { ...request, path: builtComponentPath || request.path },
  null,
  {},
  callback
)
```

We call `doResolve` on the resolver which specifies the shadowed component path if one is found, otherwise the original request. This is what tells webpack to resolve and bundle that particular file.

#### Resolving a shadowed component

When looking for a component we perform a search that occurs in two locations:

- user's project
- themes

##### User's project

In order to ensure that the user's project always takes precedence in terms of shadowing it's prepended to the theme list when attempting to resolve the component. This ensures that `my-site/src/gatsby-theme-tomato/box.js` will take priority over any other theme that might want to shadow the same component.

##### Themes

As discussed before, themes are flattened into a list and then all possible shadow paths are constructed to match against. When concatenating with the user's project it's important to note again that the themes array is reversed. This is how we ensure that "the last theme wins" when resolving a shadowed file. We walk the list for matches from start to finish.

```js
const locationsToCheck = [
  // User's site
  path.join(path.resolve(`.`), `src`, theme),
].concat(
  Array.from(themes)
    // Last theme wins, so start matching reverse
    .reverse()
    // Create the full theme directory path to check against
    .map(({ themeDir }) => path.join(themeDir, `src`, theme))
)
```

Additionally, the original theme is removed because that's the default behavior of webpack so we don't need to resolve a theme to itself.

```js
const themes = ogThemes.filter(({ themeName }) => themeName !== theme)
```

#### All together

The shadowing algorithm can be boiled down the following function that's roughly 20 lines of code:

```js
resolveComponentPath({
  matchingTheme: theme,
  themes: ogThemes,
  component,
}) {
  // don't include matching theme in possible shadowing paths
  const themes = ogThemes.filter(({ themeName }) => themeName !== theme)
  if (!this.cache[`${theme}-${component}`]) {
    this.cache[`${theme}-${component}`] = [
      path.join(path.resolve(`.`), `src`, theme),
    ]
      .concat(
        Array.from(themes)
          .reverse()
          .map(({ themeDir }) => path.join(themeDir, `src`, theme))
      )
      .map(dir => path.join(dir, component))
      .find(possibleComponentPath => {
        debug(`possibleComponentPath`, possibleComponentPath)
        let dir
        try {
          // we use fs/path instead of require.resolve to work with
          // TypeScript and alternate syntaxes
          dir = fs.readdirSync(path.dirname(possibleComponentPath))
        } catch (e) {
          return false
        }
        const exists = dir
          .map(filepath => {
            const ext = path.extname(filepath)
            const filenameWithoutExtension = path.basename(filepath, ext)
            return filenameWithoutExtension
          })
          .includes(
            path.basename(
              possibleComponentPath,
              path.extname(possibleComponentPath)
            )
          )
        return exists
      })
  }
```

### Handling component extending

This is where things begin to get a bit whacky. In addition to overriding a file, we want it to be possible to import the very component you're shadowing so that you can wrap it or even add props.

```js
import React from "react"
import { Author } from "gatsby-theme-blog/src/components/author"
import Card from "../components/card"

export default function MyAuthor(props) {
  return (
    <Card>
      <Author {...props} />
    </Card>
  )
}
```

[Learn more about extending components](/blog/2019-07-02-extending-components/)

This is the first case we'll handle when attempting to resolve the file.

In order to do this we need to leverage the **issuer** of the request. This points to the file that the request came from. This means it refers to _where_ the `import` occurs.
The **request** refers to what the import points to.

This is implemented by another method on the plugin's class which we call `requestPathIsIssuerShadowPath` which has the following method signature:

```js
requestPathIsIssuerShadowPath({
  theme,
  component,
  requestPath: request.path,
  issuerPath: request.context.issuer,
})
```

`requestPathIsIssuerShadowPath` checks all possible directories for shadowing and then returns whether the issuer's path is found. Let's first take a look at the code and then unpack what's happening here.

```js
requestPathIsIssuerShadowPath({ requestPath, issuerPath, theme }) {
  const shadowFiles = this.getBaseShadowDirsForThemes(theme).map(dir =>
    path.join(dir, component)
  )

  return shadowFiles.includes(pathWithoutExtension(issuerPath))
}
```

In the above code block `getBaseShadowDirsForThemes` returns:

```js
const baseDirs = [
  "/Users/johno/c/gatsby-theme-example-component-extending/gatsby-theme-rebeccapurple/src/gatsby-theme-tomato",
  "/Users/johno/c/gatsby-theme-example-component-extending/gatsby-theme-tomato/src",
]
```

This constructs the shadowable files for `gatsby-theme-tomato`'s Box component.
Then, we join the component path and end up with:

```js
const fullPaths = [
  "/Users/johno/c/gatsby-theme-example-component-extending/gatsby-theme-rebeccapurple/src/gatsby-theme-tomato/box",
  "/Users/johno/c/gatsby-theme-example-component-extending/gatsby-theme-tomato/src/box",
]
```

We then know that if the issuer _matches_ one of these components that it's being extended. This means that a shadowed component is extending the same component from its parent.

When this happens, we return the next path, so here the original location of the theme: `/Users/johno/c/gatsby-theme-example-component-extending/gatsby-theme-tomato/src/box`.

This means that when our shadowed file imports Box from a shadowed file we return the original box component defined in the theme.

As a result, the following will work as we expect:

```js
import React from "react"
import Box from "gatsby-theme-tomato/src/box"
import Card from "../components/card"

export default function MyBox(props) {
  return (
    <div style={{ padding: "20px", backgroundColor: "rebeccapurple" }}>
      <Box {...props} />
    </div>
  )
}
```

Now, all usages of the Box in `gatsby-theme-tomato` will be also wrapped in a purple box.

#### An edge case

If a theme sets [`module` config](https://webpack.js.org/configuration/resolve/#resolvemodules) the issuer will be null. As such we need to first check that the `request.context.issuer` is present before we attempt to resolve the shadowed component.

It's important to note that we don't recommend appending to the modules list in themes.
Though, if you do, we will make sure we don't arbitrarily error.

## Summary

Shadowing uses a predictable algorithm that leverages webpack to dynamically change module resolution based on a `gatsby-config` and theme composition.
The last theme will take precedence in the shadowing algorithm, and the user's `src` directory is always take into account first.
