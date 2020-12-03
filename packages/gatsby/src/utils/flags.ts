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
    description: `Don't process images during development until they're requested from the browser. Speeds starting the develop server. Requires gatsby-plugin-sharp@2.10.0 or above.`,
    umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/27603`,
  },
  {
    name: `PRESERVE_WEBPACK_CACHE`,
    env: `GATSBY_EXPERIMENTAL_PRESERVE_WEBPACK_CACHE`,
    command: `all`,
    telemetryId: `PreserveWebpackCache`,
    experimental: false,
    description: `Don't delete webpack's cache when changing gatsby-node.js & gatsby-config.js files.`,
    umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/28331`,
  },
  {
    name: `PRESERVE_FILE_DOWNLOAD_CACHE`,
    env: `GATSBY_EXPERIMENTAL_PRESERVE_FILE_DOWNLOAD_CACHE`,
    command: `all`,
    telemetryId: `PreserveFileDownloadCache`,
    experimental: false,
    description: `Don't delete the downloaded files cache when changing gatsby-node.js & gatsby-config.js files.`,
    umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/28331`,
  },
  {
    name: `FAST_REFRESH`,
    env: `GATSBY_FAST_REFRESH`,
    command: `develop`,
    telemetryId: `FastRefresh`,
    experimental: false,
    description: `Use React Fast Refresh instead of the legacy react-hot-loader for instantaneous feedback in your development server. Recommended for versions of React >= 17.0.`,
    umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/28390`,
  },
  {
    name: `PARALLEL_SOURCING`,
    env: `GATSBY_EXPERIMENTAL_PARALLEL_SOURCING`,
    command: `all`,
    telemetryId: `ParallelSourcing`,
    experimental: true,
    description: `Run all source plugins at the same time instead of serially. For sites with multiple source plugins, this can speedup sourcing and transforming considerably.`,
    umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/28336`,
  },
]

export default activeFlags
