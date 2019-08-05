---
title: Commands (Gatsby CLI)
---

# gatsby-cli

The Gatsby command line tool (CLI) is the main entry point for getting up and running with a Gatsby application and for using functionality including like running a development server and building out your Gatsby application for deployment.

_We provide similar documentation available with the gatsby-cli [README](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-cli/README.md), and our [cheat sheet](/docs/cheat-sheet/) has all the top CLI commands ready to print out._

## Note on globally installed executables

The Gatsby CLI (`gatsby-cli`) is packaged as an executable that can be used globally--in fact, this was previously how we recommended using the CLI.

However, global installs of the Gatsby CLI can sometimes lead to subtle bugs in behavior and functionality if the version of the globally installed executable does not match the version of Gatsby in your application. To avoid this, we highly recommend using the `package.json` script variant of these commands, typically exposed _for you_ with most [starters](/docs/starters/).

For example, if we want to make the [`gatsby develop`](#develop) command available in our application, we would open up `package.json` and add a script like so:

```json:title=package.json
{
  "scripts": {
    "develop": "gatsby develop"
  }
}
```

Now we have the `develop` script available to be used which will use our package's version of Gatsby, rather than a globally installed version. It can be run by using the name of the script, e.g. `npm run develop` in this case. Feel free to [read more about NPM scripts](https://docs.npmjs.com/misc/scripts) if you're interested!

## How to use

The Gatsby CLI is available via [npm](https://www.npmjs.com/) and should be installed globally by running `npm install -g gatsby-cli` to use it locally.

Run `gatsby --help` for full help.

### `new`

`gatsby new gatsby-site`

See the [Gatsby starters docs](/docs/starters/)
for a comprehensive list of starters to get started with Gatsby.

### `develop`

Once you've installed a Gatsby site, go to the root directory of your project and start the development server:

`gatsby develop`

#### Options

|     Option      | Description                                     |
| :-------------: | ----------------------------------------------- |
| `-H`, `--host`  | Set host. Defaults to localhost                 |
| `-p`, `--port`  | Set port. Defaults to 8000                      |
| `-o`, `--open`  | Open the site in your (default) browser for you |
| `-S`, `--https` | Use HTTPS                                       |

Follow the [Local HTTPS guide](/docs/local-https/)
to find out how you can set up an HTTPS development server using Gatsby.

### `build`

At the root of a Gatsby site, compile your application and make it ready for deployment:

`gatsby build`

#### Options

|            Option            | Description                                                                                               |
| :--------------------------: | --------------------------------------------------------------------------------------------------------- |
|       `--prefix-paths`       | Build site with link paths prefixed (set pathPrefix in your config)                                       |
|        `--no-uglify`         | Build site without uglifying JS bundles (for debugging)                                                   |
| `--open-tracing-config-file` | Tracer configuration file (OpenTracing compatible). See [Performance Tracing](/docs/performance-tracing/) |
| `--no-color`, `--no-colors`  | Disables colored terminal output                                                                          |

### `serve`

At the root of a Gatsby site, serve the production build of your site for testing:

`gatsby serve`

#### Options

|      Option      | Description                                                                              |
| :--------------: | ---------------------------------------------------------------------------------------- |
|  `-H`, `--host`  | Set host. Defaults to localhost                                                          |
|  `-p`, `--port`  | Set port. Defaults to 9000                                                               |
|  `-o`, `--open`  | Open the site in your (default) browser for you                                          |
| `--prefix-paths` | Serve site with link paths prefixed (if built with pathPrefix in your gatsby-config.js). |

### `info`

At the root of a Gatsby site, get helpful environment information which will be required when reporting a bug:

`gatsby info`

#### Options

|       Option        | Description                                             |
| :-----------------: | ------------------------------------------------------- |
| `-C`, `--clipboard` | Automagically copy environment information to clipboard |

### `clean`

At the root of a Gatsby site, wipe out the cache (`.cache` folder) and public directories:

`gatsby clean`

This is useful as a last resort when your local project seems to have issues or content does not seem to be refreshing. Issues this may fix commonly include:

- Stale data, e.g. this file/resource/etc. isn't appearing
- GraphQL error, e.g. this GraphQL resource should be present but is not
- Dependency issues, e.g. invalid version, cryptic errors in console, etc.
- Plugin issues, e.g. developing a local plugin and changes don't seem to be taking effect

### `plugin`

Run commands pertaining to gatsby plugins.

#### `docs`

`gatsby plugin docs`

Directs you to documentation about using and creating plugins.

### Repl

Get a Node.js REPL (interactive shell) with context of your Gatsby environment:

`gatsby repl`

Gatsby will prompt you to type in commands and explore. When it shows this: `gatsby >`

You can type in a command, such as one of these:

`babelrc`

`components`

`dataPaths`

`getNodes()`

`nodes`

`pages`

`schema`

`siteConfig`

`staticQueries`

When combined with the [GraphQL explorer](/docs/introducing-graphiql/), these REPL commands could be very helpful for understanding your Gatsby site's data.

See the Gatsby REPL documentation [here](/docs/gatsby-repl/).
