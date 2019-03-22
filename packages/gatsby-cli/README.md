# gatsby-cli

The Gatsby command line interface (CLI). It is used to perform common functionality, such as creating a Gatsby application based on a starter, spinning up a hot-reloading local development server, and more!

Let's you create new Gatsby apps using
[Gatsby starters](https://www.gatsbyjs.org/docs/gatsby-starters/).

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

We can now use the `develop` script tied to our app's version of Gatsby, rather than a globally installed version. This script can be invoked by using the name of the script, e.g. `npm run develop` in this case. Feel free to [read more about NPM scripts](https://docs.npmjs.com/misc/scripts) if you're interested!

## How to use

The Gatsby CLI is available via [npm](https://www.npmjs.com/) and should be installed globally by running `npm install -g gatsby-cli` to use it locally.

Run `gatsby --help` for full help.

## Commands

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

At the root of a Gatsby app run `gatsby build` to do a production build of a site.

#### Options

|            Option            | Description                                                                                                | Default |
| :--------------------------: | ---------------------------------------------------------------------------------------------------------- | :-----: |
|       `--prefix-paths`       | Build site with link paths prefixed (set pathPrefix in your config)                                        | `false` |
|        `--no-uglify`         | Build site without uglifying JS bundles (for debugging)                                                    | `false` |
| `--open-tracing-config-file` | Tracer configuration file (OpenTracing compatible). See https://www.gatsbyjs.org/docs/performance-tracing/ |         |

### `serve`

At the root of a Gatsby app run `gatsby serve` to serve the production build of the site

#### Options

|      Option      | Description                                                                              |
| :--------------: | ---------------------------------------------------------------------------------------- |
|  `-H`, `--host`  | Set host. Defaults to localhost                                                          |
|  `-p`, `--port`  | Set port. Defaults to 9000                                                               |
|  `-o`, `--open`  | Open the site in your (default) browser for you                                          |
| `--prefix-paths` | Serve site with link paths prefixed (if built with pathPrefix in your gatsby-config.js). |

### `clean`

At the root of a Gatsby app run `gatsby clean` to wipe out the cache (`.cache` folder) and `public` directories. This is useful **as a last resort** when your local project seems to have issues or content does not seem to be refreshing. Issues this may fix commonly include:

- Stale data, e.g. this file/resource/etc. isn't appearing
- GraphQL error, e.g. this GraphQL resource _should_ be present but is not
- Dependency issues, e.g. invalid version, cryptic errors in console, etc.
- Plugin issues, e.g. developing a local plugin and changes don't seem to be taking effect

### `info`

At the root of a Gatsby site run `gatsby info` to get helpful environment information which will be required when reporting a bug.

#### Options

|       Option        | Description                                             | Default |
| :-----------------: | ------------------------------------------------------- | :-----: |
| `-C`, `--clipboard` | Automagically copy environment information to clipboard | `false` |

### `repl`

Get a node repl with context of Gatsby environment

<!-- TODO: add repl documentation link when ready -->
