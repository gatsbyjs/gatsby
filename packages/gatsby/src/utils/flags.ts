import sampleSiteForExperiment from "./sample-site-for-experiment"
import _ from "lodash"
import semver from "semver"

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

export type fitnessEnum = true | false | "OPT_IN"

export interface IFlag {
  name: string
  env: string
  description: string
  command: executingCommand
  telemetryId: string
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
  // Generally just return true.
  //
  // False means it'll be disabled despite the user setting it true e.g.
  // it just won't work e.g. it doesn't have new enough version for something.
  //
  // OPT_IN means the gatsby will enable the flag (unless the user explicitly
  // disablees it.
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
    includedFlags: [
      `DEV_SSR`,
      `QUERY_ON_DEMAND`,
      `LAZY_IMAGES`,
      `PRESERVE_FILE_DOWNLOAD_CACHE`,
      `PRESERVE_WEBPACK_CACHE`,
    ],
    testFitness: (): fitnessEnum => true,
  },
  {
    name: `DEV_SSR`,
    env: `GATSBY_EXPERIMENTAL_DEV_SSR`,
    command: `develop`,
    telemetryId: `DevSsr`,
    experimental: false,
    description: `SSR pages on full reloads during develop. Helps you detect SSR bugs and fix them without needing to do full builds.`,
    umbrellaIssue: `https://gatsby.dev/dev-ssr-feedback`,
    testFitness: (): fitnessEnum => true,
  },
  {
    name: `QUERY_ON_DEMAND`,
    env: `GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND`,
    command: `develop`,
    telemetryId: `QueryOnDemand`,
    experimental: false,
    description: `Only run queries when needed instead of running all queries upfront. Speeds starting the develop server.`,
    umbrellaIssue: `https://gatsby.dev/query-on-demand-feedback`,
    noCI: true,
    testFitness: (): fitnessEnum => {
      // Take a 10% of slice of users.
      if (sampleSiteForExperiment(`QUERY_ON_DEMAND`, 10)) {
        let isPluginSharpNewEnoughOrNotInstalled = false
        try {
          // Try requiring plugin-sharp so we know if it's installed or not.
          // If it does, we also check if it's new enough.
          // eslint-disable-next-line
          require.resolve(`gatsby-plugin-sharp`)
          const semverConstraints = {
            // Because of this, this flag will never show up
            "gatsby-plugin-sharp": `>=2.10.0`,
          }
          if (satisfiesSemvers(semverConstraints)) {
            isPluginSharpNewEnoughOrNotInstalled = true
          }
        } catch (e) {
          if (e.code === `MODULE_NOT_FOUND`) {
            isPluginSharpNewEnoughOrNotInstalled = true
          }
        }

        if (isPluginSharpNewEnoughOrNotInstalled) {
          return `OPT_IN`
        } else {
          // Don't opt them in but they can still manually enable.
          return true
        }
      } else {
        // Don't opt them in but they can still manually enable.
        return true
      }
    },
  },
  {
    name: `LAZY_IMAGES`,
    env: `GATSBY_EXPERIMENTAL_LAZY_IMAGES`,
    command: `develop`,
    telemetryId: `LazyImageProcessing`,
    experimental: false,
    description: `Don't process images during development until they're requested from the browser. Speeds starting the develop server. Requires gatsby-plugin-sharp@2.10.0 or above.`,
    umbrellaIssue: `https://gatsby.dev/lazy-images-feedback`,
    noCI: true,
    testFitness: (): fitnessEnum => {
      // Take a 10% of slice of users.
      if (sampleSiteForExperiment(`QUERY_ON_DEMAND`, 10)) {
        const semverConstraints = {
          // Because of this, this flag will never show up
          "gatsby-plugin-sharp": `>=2.10.0`,
        }
        if (satisfiesSemvers(semverConstraints)) {
          return `OPT_IN`
        } else {
          // gatsby-plugi-sharp is either not installed or not new enough so
          // just disable — it won't work anyways.
          return false
        }
      } else {
        return true
      }
    },
  },
  {
    name: `PRESERVE_WEBPACK_CACHE`,
    env: `GATSBY_EXPERIMENTAL_PRESERVE_WEBPACK_CACHE`,
    command: `all`,
    telemetryId: `PreserveWebpackCache`,
    experimental: false,
    description: `Don't delete webpack's cache when changing gatsby-node.js & gatsby-config.js files.`,
    umbrellaIssue: `https://gatsby.dev/cache-clearing-feedback`,
    testFitness: (): fitnessEnum => true,
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
    name: `FAST_REFRESH`,
    env: `GATSBY_FAST_REFRESH`,
    command: `develop`,
    telemetryId: `FastRefresh`,
    experimental: false,
    description: `Use React Fast Refresh instead of the legacy react-hot-loader for instantaneous feedback in your development server. Recommended for versions of React >= 17.0.`,
    umbrellaIssue: `https://gatsby.dev/fast-refresh-feedback`,
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
]

export default activeFlags
