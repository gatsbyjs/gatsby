---
title: Commands (Gatsby CLI)
tableOfContentsDepth: 2
---

The Gatsby command line interface (CLI) is the main tool you use to initialize, build and develop Gatsby sites.

## How to use gatsby-cli

To use the Gatsby CLI you must either:

- Install it globally with `npm install -g gatsby-cli`, where you execute commands with the syntax `gatsby new`, or
- Run commands directly with [`npx`](https://www.npmjs.com/package/npx), where you execute commands with the syntax `npx gatsby new`

Useful Gatsby CLI commands are also pre-defined in [starters](/docs/starters/) as [run scripts](/docs/glossary#run-script).

## API commands

All the following documentation is available in the tool by running `gatsby --help`.

### `new`

Runs an interactive shell with a prompt that helps you set up a [CMS](/docs/glossary#cms), styling system and plugins if you wish.

To create a new site with the prompt, execute:

```shell
gatsby new
```

You can also skip the prompt and clone a starter directly from GitHub. For example, to clone a new [gatsby-starter-blog](https://github.com/gatsbyjs/gatsby-starter-blog), execute:

```shell
gatsby new my-new-blog https://github.com/gatsbyjs/gatsby-starter-blog
```

The first argument (e.g. `my-new-blog`) is the name of your site, and the second argument is the GitHub URL of the starter you want to clone.

> Note: The site name should only consist of letters and numbers. If you specify a `.`, `./` or a `<space>` in the name, `gatsby new` will throw an error.

### `develop`

Compiles and serves a development build of your site that reflects your source code changes in the browser in real time. Should be run from the root of your project.

```shell
gatsby develop
```

Options include:

| Option          | Description                                     |
| --------------- | ----------------------------------------------- |
| `-H`, `--host`  | Set host. Defaults to `localhost`               |
| `-p`, `--port`  | Set port. Defaults to `env.PORT` or `8000`      |
| `-o`, `--open`  | Open the site in your (default) browser for you |
| `-S`, `--https` | Use HTTPS                                       |
| `--inspect`     | Opens a port for debugging                      |
| `--verbose`     | Turn on verbose output                          |

To set up HTTPS, follow the [Local HTTPS guide](/docs/local-https/).

To include a URL you can access from other devices on the same network, execute:

```shell
gatsby develop -H 0.0.0.0
```

You will see this output:

```shell
You can now view gatsbyjs.com in the browser.
⠀
  Local:            http://0.0.0.0:8000/
  On Your Network:  http://192.168.0.212:8000/ // highlight-line
```

You can use the "On Your Network" URL to access your site within your network.

### `build`

Compiles your site for production so it can be deployed. Should be run from the root of your project.

```shell
gatsby build
```

Options include:

| Option                       | Description                                                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `--prefix-paths`             | Build site with link paths prefixed (set `pathPrefix` in your config)                                                                        |
| `--no-uglify`                | Build site without uglifying JS bundles (for debugging)                                                                                      |
| `--profile`                  | Build site with react profiling. See [Profiling Site Performance with React Profiler](/docs/profiling-site-performance-with-react-profiler/) |
| `--open-tracing-config-file` | Tracer configuration file (OpenTracing compatible). See [Performance Tracing](/docs/performance-tracing/)                                    |
| `--graphql-tracing`          | Trace (see above) every graphql resolver, may have performance implications.                                                                 |
| `--no-color`, `--no-colors`  | Disables colored terminal output                                                                                                             |
| `--verbose`                  | Turn on verbose output                                                                                                                       |

In addition to these build options, there are some optional [build environment variables](/docs/how-to/local-development/environment-variables/#build-variables) for more advanced configurations that can adjust how a build runs. For example, setting `CI=true` as an environment variable will tailor output for [dumb terminals](https://en.wikipedia.org/wiki/Computer_terminal#Dumb_terminals).

### `serve`

Serves the production build of your site for testing prior to deployment. Should be run from the root of your project.

```shell
gatsby serve
```

Options include:

| Option           | Description                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| `-H`, `--host`   | Set host. Defaults to `localhost`                                                              |
| `-p`, `--port`   | Set port. Defaults to `9000`                                                                   |
| `-o`, `--open`   | Open the site in your default browser for you                                                  |
| `--prefix-paths` | Serve site with link paths prefixed (if built with `pathPrefix` in your `gatsby-config` file). |

### `info`

Show helpful environment information which is required in bug reports. Should be run from the root of your project.

```shell
gatsby info
```

Options include:

| Option              | Description                                    |
| ------------------- | ---------------------------------------------- |
| `-C`, `--clipboard` | Copy environment information to your clipboard |

### `clean`

Delete the `.cache` and `public` directories. Should be run from the root of your project.

```shell
gatsby clean
```

This is useful as a last resort when your local project seems to have issues or content does not seem to be refreshing. Issues this may fix commonly include:

- Stale data, e.g. this file/resource/etc. isn't appearing
- GraphQL error, e.g. this GraphQL resource should be present but is not
- Dependency issues, e.g. invalid version, cryptic errors in console, etc.
- Plugin issues, e.g. developing a local plugin and changes don't seem to be taking effect

### `repl`

Open a Node.js REPL (interactive shell) with context of your Gatsby environment. Should be run from the root of your project.

```shell
gatsby repl
```

Gatsby will prompt you to type in commands and explore. When it shows this: `gatsby >`, you can type in one of these commands to see their values in real time:

- `babelrc`
- `components`
- `dataPaths`
- `getNodes()`
- `nodes`
- `pages`
- `schema`
- `siteConfig`
- `staticQueries`

To exit the REPL:

- Press `Ctrl+C` or `Ctrl+D` twice, or
- Type `.exit` and press `Enter`

When combined with the [GraphQL explorer](/docs/how-to/querying-data/running-queries-with-graphiql/), these REPL commands could be very helpful for understanding your Gatsby site's data.

## Disabling colored output

In addition to the explicit `--no-color` option, the CLI respects the presence of the `NO_COLOR` environment variable (see [no-color.org](https://no-color.org/)).

## How to change your default package manager for your next project?

When you use `gatsby new` for the first time to create a new project, you are asked to choose your default package manager between yarn and npm.

```shell
Which package manager would you like to use ? › - Use arrow-keys. Return to submit.
❯  yarn
   npm
```

Once you’ve made your choice, the CLI won’t ask for your preference again for any subsequent project. If you want to change the preference, there are two ways to change the default package manager for your next project:

1. [Using options command from CLI](#using-options-command-from-cli)
1. [Editing the config file](#editing-the-config-file)

### Using options command from CLI

You can use the `gatsby options` command to change the default package manager.

```shell
gatsby options set [<key> <value>]
```

| Argument | Description                                                                     |
| -------- | ------------------------------------------------------------------------------- |
| key      | Set the package manager `gatsby new` is using. choices: `pm`, `package-manager` |
| value    | Set the package manager as `npm` or `yarn`.                                     |

To set the default package manager as `yarn` you'd run:

```shell
gatsby options set package-manager yarn
```

### Editing the config file

You can also manually change the default package manager by editing the config file created automatically by the CLI.
This file is available on your system at: `~/.config/gatsby/config.json`

In it you’re going to see something like this.

```json:title=config.json
{
  "cli": {
    "packageManager": "yarn"
  }
}
```

Edit your `packageManager` value, save and you’re good to go for your next project using `gatsby new`.
