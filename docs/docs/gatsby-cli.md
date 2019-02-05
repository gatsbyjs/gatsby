---
title: Commands (Gatsby CLI)
---

# gatsby-cli

Gatsby command line tool. This doc exists in [READme form in GitHub here](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-cli/README.md).

Lets you create new Gatsby sites using
[Gatsby starters](https://www.gatsbyjs.org/docs/gatsby-starters/).

## How to use

By using [npx](https://www.npmjs.com/package/npx) you can utilise the Gatsby command line tool without installing it globally.

For example you can run `npx gatsby new your-site-name` to generate a new Gatsby site.

Run `npx gatsby --help` for full help.

### New

`npx gatsby new gatsby-site`

See the [Gatsby starters docs](https://www.gatsbyjs.org/docs/gatsby-starters/)
for more.

### Develop

At the root of a Gatsby site run `npm run develop` to start the Gatsby
development server.

#### Options

|     Option      | Description                                     |
| :-------------: | ----------------------------------------------- |
| `-H`, `--host`  | Set host. Defaults to localhost                 |
| `-p`, `--port`  | Set port. Defaults to 8000                      |
| `-o`, `--open`  | Open the site in your (default) browser for you |
| `-S`, `--https` | Use HTTPS                                       |

For example `gatsby develop --port 4000`.

When running Gatsby CLI commands with options using NPM scripts you need to include `--` to forward the options.

For example `npm run develop -- --port 4000`

Follow the [Local HTTPS guide](https://www.gatsbyjs.org/docs/local-https/)
to find out how you can set up an HTTPS development server using Gatsby.

### Build

At the root of a Gatsby site run `npm run build` to do a production build of a
site.

#### Options

|            Option            | Description                                                                                                 |
| :--------------------------: | ----------------------------------------------------------------------------------------------------------- |
|       `--prefix-paths`       | Build site with link paths prefixed (set pathPrefix in your config)                                         |
|        `--no-uglify`         | Build site without uglifying JS bundles (for debugging)                                                     |
| `--open-tracing-config-file` | Tracer configuration file (open tracing compatible). See https://www.gatsbyjs.org/docs/performance-tracing/ |

### Serve

At the root of a Gatsby site run `npm run serve` to serve the production build of
the site for testing.

#### Options

|      Option      | Description                                                                              |
| :--------------: | ---------------------------------------------------------------------------------------- |
|  `-H`, `--host`  | Set host. Defaults to localhost                                                          |
|  `-p`, `--port`  | Set port. Defaults to 8000                                                               |
|  `-o`, `--open`  | Open the site in your (default) browser for you                                          |
| `--prefix-paths` | Serve site with link paths prefixed (if built with pathPrefix in your gatsby-config.js). |

### Info

At the root of a Gatsby site run `npx gatsby info` to get helpful environment information which will be required when reporting a bug.

#### Options

|       Option        | Description                                             |
| :-----------------: | ------------------------------------------------------- |
| `-C`, `--clipboard` | Automagically copy environment information to clipboard |

### Repl

Get a node repl with context of Gatsby environment

<!-- TODO: add repl documentation link when ready -->
