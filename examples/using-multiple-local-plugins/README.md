# Using Gatsby with Local Plugins

This is an example repository demonstrating different ways to load plugins in a Gatsby site.

## Running the Example

The actual Gatsby site to run is in the `gatsby-site-using-local-plugins` folder.

Navigate into the `gatsby-site-using-local-plugins` project directory with this command:

```shell
cd gatsby-site-using-local-plugins
```

You'll need to install dependencies for the site by running:

```shell
npm install
```

Then run `gatsby develop`:

```shell
gatsby develop
```

In your command line output, you should then see the text listed below. This text is showing how the code for each plugin is run sequentially thanks to the Node API implemented.

```shell
$ gatsby develop
success open and validate gatsby-configs - 0.051s
success load plugins - 1.047s
logging to the console from plugins folder
logging to the console from a plugin in another project with require.resolve
logging to the console from site's gatsby-node
success onPreInit - 0.023s
```

For the config to load all the plugins you'll need to uncomment the line in the `gatsby-site-using-multiple-local-plugins/gatsby-config.js` file for `gatsby-plugin-console-log-c`:

```javascript:title=gatsby-site-using-multiple-local-plugins/gatsby-config.js
module.exports = {
  siteMetadata: {
    title: `Using Multiple Local Plugins`,
    description: `An example Gatsby site utilizing multiple local plugins`,
    author: `@gatsbyjs`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    // including a plugin from the plugins folder
    `gatsby-plugin-console-log-a`,
    {
      // including a plugin from outside the plugins folder needs the path to it
      resolve: require.resolve(`../gatsby-plugin-console-log-b`),
    },
    // including a plugin with yarn or npm link
    //   in order for this plugin to be found when you run gatsby develop
    //   you first need to run `npm link ../gatsby-plugin-console-log-c` in the `gatsby-site-using-local-plugins` root folder
    `gatsby-plugin-console-log-c`, // highlight-line
  ],
}
```

And then run:

```shell:title=gatsby-site-using-multiple-local-plugins
npm link ../gatsby-plugin-console-log-c
```

When you run `gatsby develop` now, you should see the last plugin logging another line:

```diff
$ gatsby develop
  success open and validate gatsby-configs - 0.051s
  success load plugins - 1.047s
  logging to the console from plugins folder
  logging to the console from a plugin in another project with require.resolve
+ logging to the console from a plugin in another project with npm/yarn link
  logging to the console from site's gatsby-node
  success onPreInit - 0.023s
```

## Context

The same `gatsby-plugin-console-log` plugin is implemented 3 times (and 1 additional time in the site's `gatsby-node`), each one hooking into the `onPreInit` Gatsby Node API to log a simple message to the console when the site is run in develop or build mode.

The code that is implemented looks similar to this:

```javascript
exports.onPreInit = () => {
  console.log("logging to the console...")
}
```

### 4 patterns implemented

The 4 ways the code is run are:

1. Inside the site's `gatsby-node.js`
2. In a plugin in the plugins folder (`gatsby-plugin-console-log-a`)
3. In a separate project folder but included with `require.resolve` in the config (`gatsby-plugin-console-log-b`)
4. In a separate project folder but included via `npm link` (`gatsby-plugin-console-log-c`)

You can read about these methods in the [loading local plugins doc](https://www.gatsbyjs.com/docs/loading-plugins-from-your-local-plugins-folder/).

## More advanced local plugin example

For another example featuring a more sophisticated local plugin, you can refer to the [`using-local-plugins` example repository](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-local-plugins).
