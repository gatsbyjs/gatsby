import sampleSiteForExperiment from "./sample-site-for-experiment"
import _ from "lodash"
import semver from "semver"

// Does this experiment run for only builds
type executingCommand = "build" | "develop" | "all"

export const satisfiesSemvers = (semverConstraints): boolean => {
  // Check each semver check for the flag.
  // If any are false, then the flag doesn't pass
  return !_.toPairs(semverConstraints).some(
    ([packageName, semverConstraint]) => {
      let packageVersion
      try {
        packageVersion = require(`${packageName}/package.json`).version
      } catch {
        return true
      }
      // const passes = semver.satisfies(packageVersion, semverConstraint)
      // console.log({ packageName, packageVersion, semverConstraint, passes })

      // We care if the semver check doesn't pass.
      return !semver.satisfies(packageVersion, semverConstraint)
    }
  )
}

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
  // it just won't work e.g. odn't have new enough version for something.
  // We warn in this case.
  //
  // OPT_IN means the gatsby will enable the flag (unless the user explicitly
  // disablees it.
  testFitness: (flag: IFlag) => true | false | "OPT_IN"
  includedFlags?: Array<string>
  umbrellaIssue?: string
  noCI?: boolean
  noCi?: boolean
}

const activeFlags: Array<IFlag> = [
  {
    name: `FAST_DEV`,
    env: `GATSBY_EXPERIMENTAL_FAST_DEV`,
    command: `develop`,
    telemetryId: `FastDev`,
    experimental: false,
    description: `Enable all experiments aimed at improving develop server start time`,
    includedFlags: [`DEV_SSR`, `QUERY_ON_DEMAND`, `LAZY_IMAGES`],
    testFitness: (): boolean => true,
  },
  {
    name: `DEV_SSR`,
    env: `GATSBY_EXPERIMENTAL_DEV_SSR`,
    command: `develop`,
    telemetryId: `DevSsr`,
    experimental: false,
    description: `SSR pages on full reloads during develop. Helps you detect SSR bugs and fix them without needing to do full builds.`,
    umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/28138`,
    testFitness: myself => {
      if (sampleSiteForExperiment(myself.name, 5)) {
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
    telemetryId: `QueryOnDemand`,
    experimental: false,
    description: `Only run queries when needed instead of running all queries upfront. Speeds starting the develop server.`,
    umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/27620`,
    noCI: true,
    testFitness: () => true,
  },
  {
    name: `LAZY_IMAGES`,
    env: `GATSBY_EXPERIMENTAL_LAZY_IMAGES`,
    command: `develop`,
    telemetryId: `LazyImageProcessing`,
    experimental: true,
    description: `Don't process images during development until they're requested from the browser. Speeds starting the develop server.`,
    umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/27603`,
    testFitness: () => true,
  },
  {
    name: `FAST_REFRESH`,
    env: `GATSBY_FAST_REFRESH`,
    command: `develop`,
    telemetryId: `FastRefresh`,
    experimental: false,
    description: `Enables FastRefresh — the new React hot reloading technology for faster and more reliable hot reloading.`,
    umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/28390`,
    testFitness: () => true,
  },
]

export default activeFlags
