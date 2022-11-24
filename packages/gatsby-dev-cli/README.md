# gatsby-dev-cli

A command-line tool for local Gatsby development. When doing development work on
Gatsby core, this tool allows you to copy the changes to the various
Gatsby packages to Gatsby sites that you're testing your changes on.

## Install

`npm install -g gatsby-dev-cli`

## Configuration / First time setup

The gatsby-dev-cli tool needs to know where your cloned Gatsby repository is
located. You typically only need to configure this once.

`gatsby-dev --set-path-to-repo /path/to/my/cloned/version/gatsby`

## How to use

Navigate to the project you want to link to your forked Gatsby repository and
run:

`gatsby-dev`

The tool will then scan your project's package.json to find its Gatsby
dependencies and copy the latest source from your cloned version of Gatsby into
your project's node_modules folder. A watch task is then created to re-copy any
modules that might change while you're working on the code, so you can leave
this program running.

Typically you'll also want to run `npm run watch` in the Gatsby repo to set up
watchers to build Gatsby source code.

## Revert to current packages

If you've recently run `gatsby-dev` your `node_modules` will be out of sync with currently published packages. In order to undo this, you can remove the `node_modules` directory or run:

```shell
git checkout package.json; yarn --force
```

or

```shell
git checkout package.json; npm install --force
```

**[Demo Video](https://www.youtube.com/watch?v=D0SwX1MSuas)**

More detailed instructions for setting up your Gatsby development environment can
be found [here](https://www.gatsbyjs.com/contributing/how-to-contribute/).

### Other commands

#### `--packages`

You can prevent the automatic dependencies scan and instead specify a list of
packages you want to link by using the `--packages` option:

`gatsby-dev --packages gatsby gatsby-transformer-remark`

#### `--scan-once`

With this flag, the tool will do an initial scan and copy and then quit. This is
useful for setting up automated testing/builds of Gatsby sites from the latest
code. Gatsby's CI is using this for its tests.

#### `--quiet`

Don't output anything except for a success message when used together with
`--scan-once`.

#### `--copy-all`

Copy all modules/files in the gatsby source repo in packages/

#### `--force-install`

Disable copying files into node_modules and force usage of local npm repository.

#### `--external-registry`

Run `yarn add` commands without the `--registry` flag. This is helpful when using yarn 2/3 and you need to use `yarn config set npmRegistryServer http://localhost:4873` and `echo -e 'unsafeHttpWhitelist:\n - "localhost"' >> .yarnrc.yml` before running `gatsby-dev-cli`.
