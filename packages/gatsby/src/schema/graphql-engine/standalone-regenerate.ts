#!/usr/bin/env node

/*
This is used mostly for development purposes, but can be attempted to be used
to regenerate just engines for local platform/arch if previous full build
was done to deploy on platform with different arch/platform.

For development purposes this is used to be able to run `gatsby build` once to
source data and print schema and then just rebundle graphql-engine
with source file changes and test re-built engine quickly

Usage:
There need to be at least one successful `gatsby build`
before starting to use this script (warm up datastore,
generate "page-ssr" bundle). Once that's done you can
run following command in site directory:

```shell
node node_modules/gatsby/dist/schema/graphql-engine/standalone-regenerate.js
```
*/

import { createGraphqlEngineBundle } from "./bundle-webpack"
import { createPageSSRBundle } from "./../../utils/page-ssr-module/bundle-webpack"
import reporter from "gatsby-cli/lib/reporter"
import { loadConfigAndPlugins } from "../../utils/worker/child/load-config-and-plugins"
import * as fs from "fs-extra"
import { store } from "../../redux"
import { validateEnginesWithActivity } from "../../utils/validate-engines"

async function run(): Promise<void> {
  process.env.GATSBY_SLICES = `1`
  // load config
  reporter.verbose(`loading config and plugins`)
  await loadConfigAndPlugins({
    siteDirectory: process.cwd(),
  })

  try {
    reporter.verbose(`clearing webpack cache`)
    // get rid of cache if it exist
    await fs.remove(process.cwd() + `/.cache/webpack/query-engine`)
    await fs.remove(process.cwd() + `/.cache/webpack/page-ssr`)
  } catch (e) {
    // eslint-disable no-empty
  }

  const state = store.getState()

  // recompile
  const buildActivityTimer = reporter.activityTimer(
    `(Re)Building Rendering Engines`
  )
  try {
    buildActivityTimer.start()
    await Promise.all([
      createGraphqlEngineBundle(process.cwd(), reporter, true),
      createPageSSRBundle({
        rootDir: process.cwd(),
        components: store.getState().components,
        staticQueriesByTemplate: state.staticQueriesByTemplate,
        webpackCompilationHash: state.webpackCompilationHash, // we set webpackCompilationHash above
        reporter,
        isVerbose: state.program.verbose,
      }),
    ])
  } catch (err) {
    buildActivityTimer.panic(err)
  } finally {
    buildActivityTimer.end()
  }

  await validateEnginesWithActivity(process.cwd())

  reporter.info(`Rebuilding Rendering Engines finished`)
}

run()
