// Does this experiment run for only builds
type executingCommand = "build" | "develop" | "all"

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
  includedFlags?: Array<string>
  umbrellaIssue?: string
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
  },
  {
    name: `DEV_SSR`,
    env: `GATSBY_EXPERIMENTAL_DEV_SSR`,
    command: `develop`,
    telemetryId: `DevSsr`,
    experimental: false,
    description: `SSR pages on full reloads during develop. Helps you detect SSR bugs and fix them without needing to do full builds.`,
    umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/28138`,
  },
  {
    name: `QUERY_ON_DEMAND`,
    env: `GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND`,
    command: `develop`,
    telemetryId: `QueryOnDemand`,
    experimental: false,
    description: `Only run queries when needed instead of running all queries upfront. Speeds starting the develop server.`,
    umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/27620`,
    noCi: true,
  },
  {
    name: `LAZY_IMAGES`,
    env: `GATSBY_EXPERIMENTAL_LAZY_IMAGES`,
    command: `develop`,
    telemetryId: `LazyImageProcessing`,
    experimental: true,
    description: `Don't process images during development until they're requested from the browser. Speeds starting the develop server.`,
    umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/27603`,
  },
]

export default activeFlags
