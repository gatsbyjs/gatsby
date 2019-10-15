# gatsby-plugin-manifest performance tests

- Setup: `yarn`
- Run: `yarn test`

Benchmarks the current production version of the plugin unless you use `gatsby-dev`.

## To benchmark the current branch:

```shell
# In the root of the Gatsby repository
$ yarn run watch --scope=gatsby-plugin-manifest .
```

```shell
# In ./benchmarks/plugin-manifest
# You'll need 'gatsby-dev' installed and configured globally.
$ gatsby-dev --packages gatsby-plugin-manifest
```

You may now switch branches using `git checkout` and edit code on the current branch. Changes will be compiled into the local `node_modules` for the benchmark.
