# gatsby-cli

Gatsby command line tool.

Let's you create new Gatsby apps using
[Gatsby starters](https://www.gatsbyjs.org/docs/gatsby-starters/).

It also let's you run commands on sites. The tool runs code from the `gatsby`
package installed locally.

## Install

`npm install --global gatsby-cli`

## How to use

Run `gatsby --help` for full help.

### `new`

`gatsby new gatsby-site`

See the [Gatsby starters docs](https://www.gatsbyjs.org/docs/gatsby-starters/)
for more.

### `develop`

At the root of a Gatsby app run `gatsby develop` to start the Gatsby
development server.

#### Options

|     Option      | Description                                     |   Default   |
| :-------------: | ----------------------------------------------- | :---------: |
| `-H`, `--host`  | Set host.                                       | `localhost` |
| `-p`, `--port`  | Set port.                                       |   `8000`    |
| `-o`, `--open`  | Open the site in your (default) browser for you |             |
| `-S`, `--https` | Use HTTPS                                       |             |

Follow the [Local HTTPS guide](https://www.gatsbyjs.org/docs/local-https/)
to find out how you can set up an HTTPS development server using Gatsby.

### `build`

At the root of a Gatsby app run `gatsby build` to do a production build of a
site.

#### Options

|            Option            | Description                                                                                                 | Default |
| :--------------------------: | ----------------------------------------------------------------------------------------------------------- | :-----: |
|       `--prefix-paths`       | Build site with link paths prefixed (set pathPrefix in your config)                                         | `false` |
|        `--no-uglify`         | Build site without uglifying JS bundles (for debugging)                                                     | `false` |
| `--open-tracing-config-file` | Tracer configuration file (open tracing compatible). See https://www.gatsbyjs.org/docs/performance-tracing/ |         |

### `serve`

At the root of a Gatsby app run `gatsby serve` to serve the production build of
the site for testing.

#### Options

|      Option      | Description                                                                              |
| :--------------: | ---------------------------------------------------------------------------------------- |
|  `-H`, `--host`  | Set host. Defaults to localhost                                                          |
|  `-p`, `--port`  | Set port. Defaults to 8000                                                               |
|  `-o`, `--open`  | Open the site in your (default) browser for you                                          |
| `--prefix-paths` | Serve site with link paths prefixed (if built with pathPrefix in your gatsby-config.js). |

### `clean`

At the root of a Gatsby app run `gatsby clean` to wipe out the cache (`.cache` folder) and `public` directories. This is useful **as a last resort** when your local project seems to have issues or content does not seem to be refreshing. Issues this may fix commonly include:

- Stale data, e.g. this file/resource/etc. isn't appearing
- GraphQL error, e.g. this GraphQL resource _should_ be present but is not
- Dependency issues, e.g. invalid version, cryptic errors in console, etc.

### `info`

At the root of a Gatsby app run `gatsby info` to get helpful environment information which will be required when reporting a bug.

#### Options

|       Option        | Description                                             | Default |
| :-----------------: | ------------------------------------------------------- | :-----: |
| `-C`, `--clipboard` | Automagically copy environment information to clipboard | `false` |

### `repl`

Get a node repl with context of Gatsby environment

<!-- TODO: add repl documentation link when ready -->
