# Using Gatsby with Local Plugins

This is an example repository demonstrating different ways to load plugins in a Gatsby site.

_The actual Gatsby site to run is in the `gatsby-site-using-local-plugins` folder._

The same `gatsby-plugin-console-log` plugin is implemented 3 times (and 1 additional time in the site's `gatsby-node`), each one hooking into the `onPreInit` Gatsby Node API to log a simple message to the console when the site is run in develop or build mode.

The code that is implemented looks similar to this:

```javascript
exports.onPreInit = () => {
  console.log("logging to the console...")
}
```

## 4 patterns

The 4 ways the code is run are:

1. Inside the site's `gatsby-node.js`
2. In a plugin in the plugins folder (`gatsby-plugin-console-log-a`)
3. In a separate project folder but included with `require.resolve` in the config (`gatsby-plugin-console-log-b`)
4. In a separate project folder but included via `npm link` (`gatsby-plugin-console-log-c`)

## Running the site to

For the config to load all the plugins you'll need to run:

```sh
npm link ../gatsby-plugin-console-log-c
```

From the root of `gatsby-site-using-local-plugins`.

When you run `gatsby develop` inside the `gatsby-site-using-local-plugins` folder you should then see the output listed below. Showing how the code for each plugin is run sequentially thanks to the Node API implemented.

```sh
$ gatsby develop
success open and validate gatsby-configs - 0.051s
success load plugins - 1.047s
logging to the console from plugins folder
logging to the console from a plugin in another project with require.resolve
logging to the console from a plugin in another project with npm/yarn link
logging to the console from site's gatsby-node
success onPreInit - 0.023s
```

## More advanced local plugin example

For another example featuring a more sophisticated local plugin, you can refer to the [`using-local-plugins` example repository](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-local-plugins).
