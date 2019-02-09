---
title: Commands (Gatsby CLI)
---

# gatsby-cli

The Gatsby command line tool (CLI) is the main entry point for getting up and running with a Gatsby application and for using functionality including like running a development server and building out your Gatsby application for deployment.

_We provide similar documentation available with the gatsby-cli [README](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-cli/README.md)._

## Note on globally installed executables

The Gatsby CLI (`gatsby-cli`) is packaged as an executable that can be used globally--in fact, this was previously how we recommended using the CLI.

However, global installs of the Gatsby CLI can sometimes lead to subtle bugs in behavior and functionality if the version of the globally installed executable does not match the version of Gatsby in your application. To avoid this, we highly recommend using the `package.json` script variant of these commands, typically exposed _for you_ with most starters.

For example, if we want to make the [`gatsby develop`](#develop) command available in our application, we would open up `package.json` and add a script like so:

```json:title
{
  "scripts": {
    "develop": "gatsby develop"
  }
}
```

Now we have the `develop` script available to be used which will use our package's version of Gatsby, rather than a globally installed version. It can be run by using the name of the script, e.g. `npm run develop` in this case. Feel free to [read more about NPM scripts](https://docs.npmjs.com/misc/scripts) if you're interested!

## How to use

By using [npx](https://www.npmjs.com/package/npx) you can utilize the Gatsby command line tool without installing it globally. This lets you scaffold a project with just one command!

For example you can run `npx gatsby new your-site-name` to generate a new Gatsby site.

Run `npx gatsby --help` for full help.

### `new`

`npx gatsby new gatsby-site`

See the [Gatsby starters docs](https://www.gatsbyjs.org/docs/gatsby-starters/)
for a comprehensive list of starters to get started with Gatsby.

### `develop`

At the root of a Gatsby app use the `gatsby develop` script to start the Gatsby
development server.

#### Options

|     Option      | Description                                     |
| :-------------: | ----------------------------------------------- |
| `-H`, `--host`  | Set host. Defaults to localhost                 |
| `-p`, `--port`  | Set port. Defaults to 8000                      |
| `-o`, `--open`  | Open the site in your (default) browser for you |
| `-S`, `--https` | Use HTTPS                                       |

Follow the [Local HTTPS guide](https://www.gatsbyjs.org/docs/local-https/)
to find out how you can set up an HTTPS development server using Gatsby.

### `build`

At the root of a Gatsby site run `gatsby build` script to compile your application and make it ready for deployment.

#### Options

|            Option            | Description                                                                                                 |
| :--------------------------: | ----------------------------------------------------------------------------------------------------------- |
|       `--prefix-paths`       | Build site with link paths prefixed (set pathPrefix in your config)                                         |
|        `--no-uglify`         | Build site without uglifying JS bundles (for debugging)                                                     |
| `--open-tracing-config-file` | Tracer configuration file (open tracing compatible). See https://www.gatsbyjs.org/docs/performance-tracing/ |

### `serve`

At the root of a Gatsby site run `gatsby serve` to serve the production build of
the site for testing.

#### Options

|      Option      | Description                                                                              |
| :--------------: | ---------------------------------------------------------------------------------------- |
|  `-H`, `--host`  | Set host. Defaults to localhost                                                          |
|  `-p`, `--port`  | Set port. Defaults to 8000                                                               |
|  `-o`, `--open`  | Open the site in your (default) browser for you                                          |
| `--prefix-paths` | Serve site with link paths prefixed (if built with pathPrefix in your gatsby-config.js). |

### `info`

At the root of a Gatsby site run `npx gatsby info` to get helpful environment information which will be required when reporting a bug.

#### Options

|       Option        | Description                                             |
| :-----------------: | ------------------------------------------------------- |
| `-C`, `--clipboard` | Automagically copy environment information to clipboard |

### Repl

Get a Node.js REPL (interactive shell) with context of Gatsby environment

<!-- TODO: add repl documentation link when ready -->
