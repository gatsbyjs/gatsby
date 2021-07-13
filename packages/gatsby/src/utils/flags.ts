import _ from "lodash"
import semver from "semver"

import sampleSiteForExperiment from "./sample-site-for-experiment"

// Does this experiment run for only builds
type executingCommand = "build" | "develop" | "all"

export const satisfiesSemvers = (
  semverConstraints: Record<string, string>
): boolean => {
  // Check each semver check for the flag.
  // If any are false, then the flag doesn't pass
  const result = _.toPairs(semverConstraints).every(
    ([packageName, semverConstraint]) => {
      let packageVersion: string
      try {
        packageVersion = require(`${packageName}/package.json`).version
      } catch (e) {
        return false
      }

      // We care if the semver check doesn't pass.
      return semver.satisfies(packageVersion, semverConstraint, {
        includePrerelease: true,
      })
    }
  )

  return result
}

export type fitnessEnum = true | false | "OPT_IN" | "LOCKED_IN"

export interface IFlag {
  name: string
  env: string
  description: string
  command: executingCommand
  /**
   * Use string identifier to track enabled flag or false to disable any tracking (useful when flag becomes new defaults)
   */
  telemetryId: string | false
  // Heuristics for deciding if a flag is experimental:
  // - there are known bugs most people will encounter and that block being
  // able to use Gatsby normally
  // - very few people have tested the feature so we're not sure if we've
  // uncovered even common problems.
  //
  // Flags should start as experimental but once all serious known bugs are
  // resolved and ~50+ people have tested it, experimental should be set to
  // false.
  experimental: boolean
  /**
   * True means conditions for the feature are met and can be opted in by user.
   *
   * False means it'll be disabled despite the user setting it true e.g.
   * it just won't work e.g. it doesn't have new enough version for something.
   *
   * OPT_IN means the gatsby will enable the flag (unless the user explicitly
   * disables it.
   *
   * LOCKED_IN means that feature is enabled always (unless `noCI` condition is met).
   * This is mostly to provide more meaningful terminal messages instead of removing
   * flag from the flag list when users has the flag set in configuration
   * (avoids showing unknown flag message and shows "no longer needed" message).
   */
  testFitness: (flag: IFlag) => fitnessEnum
  includedFlags?: Array<string>
  umbrellaIssue?: string
  noCI?: boolean
}

const activeFlags: Array<IFlag> = [
  {
    name: `FAST_DEV`,
    env: `GATSBY_EXPERIMENTAL_FAST_DEV`,
    command: `develop`,
    telemetryId: `FastDev`,
    experimental: false,
    description: `Enable all experiments aimed at improving develop server start time`,
    includedFlags: [`DEV_SSR`, `PRESERVE_FILE_DOWNLOAD_CACHE`],
    testFitness: (): fitnessEnum => true,
  },
  {
    name: `DEV_SSR`,
    env: `GATSBY_EXPERIMENTAL_DEV_SSR`,
    command: `develop`,
    telemetryId: `DevSsr`,
    experimental: false,
    description: `Server Side Render (SSR) pages on full reloads during develop. Helps you detect SSR bugs and fix them without needing to do full builds. See umbrella issue for how to update custom webpack config.`,
    umbrellaIssue: `https://gatsby.dev/dev-ssr-feedback`,
    testFitness: (): fitnessEnum => {
      if (sampleSiteForExperiment(`DEV_SSR`, 20)) {
        return `OPT_IN`
      } else {
        return true
      }
    },
  },
  {
    name: `QUERY_ON_DEMAND`,
    env: `GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND`,
    command: `develop`,
    telemetryId: false,
    experimental: false,
    description: `Only run queries when needed instead of running all queries upfront. Speeds starting the develop server.`,
    umbrellaIssue: `https://gatsby.dev/query-on-demand-feedback`,
    noCI: true,
    testFitness: (): fitnessEnum => `LOCKED_IN`,
  },
  {
    name: `LAZY_IMAGES`,
    env: `GATSBY_EXPERIMENTAL_LAZY_IMAGES`,
    command: `develop`,
    telemetryId: false,
    experimental: false,
    description: `Don't process images during development until they're requested from the browser. Speeds starting the develop server. Requires gatsby-plugin-sharp@2.10.0 or above.`,
    umbrellaIssue: `https://gatsby.dev/lazy-images-feedback`,
    noCI: true,
    testFitness: (): fitnessEnum => {
      const semverConstraints = {
        // Because of this, this flag will never show up
        "gatsby-plugin-sharp": `>=2.10.0`,
      }
      if (satisfiesSemvers(semverConstraints)) {
        return `LOCKED_IN`
      } else {
        // gatsby-plugin-sharp is either not installed or not new enough so
        // just disable — it won't work anyways.
        return false
      }
    },
  },
  {
    name: `PRESERVE_WEBPACK_CACHE`,
    env: `GATSBY_EXPERIMENTAL_PRESERVE_WEBPACK_CACHE`,
    command: `all`,
    telemetryId: `PreserveWebpackCache`,
    experimental: false,
    description: `Use webpack's persistent caching and don't delete webpack's cache when changing gatsby-node.js & gatsby-config.js files.`,
    umbrellaIssue: `https://gatsby.dev/cache-clearing-feedback`,
    testFitness: (): fitnessEnum => `LOCKED_IN`,
  },
  {
    name: `PRESERVE_FILE_DOWNLOAD_CACHE`,
    env: `GATSBY_EXPERIMENTAL_PRESERVE_FILE_DOWNLOAD_CACHE`,
    command: `all`,
    telemetryId: `PreserveFileDownloadCache`,
    experimental: false,
    description: `Don't delete the downloaded files cache when changing gatsby-node.js & gatsby-config.js files.`,
    umbrellaIssue: `https://gatsby.dev/cache-clearing-feedback`,
    testFitness: (): fitnessEnum => true,
  },
  {
    name: `PARALLEL_SOURCING`,
    env: `GATSBY_EXPERIMENTAL_PARALLEL_SOURCING`,
    command: `all`,
    telemetryId: `ParallelSourcing`,
    experimental: true,
    description: `Run all source plugins at the same time instead of serially. For sites with multiple source plugins, this can speedup sourcing and transforming considerably.`,
    umbrellaIssue: `https://gatsby.dev/parallel-sourcing-feedback`,
    testFitness: (): fitnessEnum => true,
  },
  {
    name: `FUNCTIONS`,
    env: `GATSBY_EXPERIMENTAL_FUNCTIONS`,
    command: `all`,
    telemetryId: `Functions`,
    experimental: false,
    description: `Compile Serverless functions in your Gatsby project and write them to disk, ready to deploy to Gatsby Cloud`,
    umbrellaIssue: `https://gatsby.dev/functions-feedback`,
    testFitness: (): fitnessEnum => `LOCKED_IN`,
  },
  {
    name: `LMDB_STORE`,
    env: `GATSBY_EXPERIMENTAL_LMDB_STORE`,
    command: `all`,
    telemetryId: `LmdbStore`,
    experimental: true,
    umbrellaIssue: `https://gatsby.dev/lmdb-feedback`,
    description: `Store nodes in a persistent embedded database (vs in-memory). Lowers peak memory usage. Requires Node v14.10 or above.`,
    testFitness: (): fitnessEnum => {
      const [major, minor] = process.versions.node.split(`.`)
      return (Number(major) === 14 && Number(minor) >= 10) || Number(major) > 14
    },
  },
  {
    name: `PARALLEL_QUERY_RUNNING`,
    env: `GATSBY_EXPERIMENTAL_PARALLEL_QUERY_RUNNING`,
    command: `build`,
    telemetryId: `PQR`,
    experimental: true,
    umbrellaIssue: `https://gatsby.dev/pqr-feedback`,
    description: `Parallelize running page queries in order to better saturate all available cores. Improves time it takes to run queries during gatsby build. Requires Node v14.10 or above.`,
    includedFlags: [`LMDB_STORE`],
    testFitness: (): fitnessEnum => {
      const [major, minor] = process.versions.node.split(`.`)
      return (Number(major) === 14 && Number(minor) >= 10) || Number(major) > 14
    },
  },
]

export default activeFlags
