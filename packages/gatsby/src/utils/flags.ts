// Does this experiment run for only builds
type executingCommand = "build" | "develop" | "all"

export interface IFlag {
  name: string
  env: string
  description: string
  command: executingCommand
  telemetryId: string
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
    description: `Enable all experiments aimed at improving develop server start time`,
    includedFlags: [`DEV_SSR`, `QUERY_ON_DEMAND`],
  },
  {
    name: `DEV_SSR`,
    env: `GATSBY_EXPERIMENTAL_DEV_SSR`,
    command: `develop`,
    telemetryId: `DevSsr`,
    description: `SSR pages on full reloads during develop. Helps you detect SSR bugs and fix them without needing to do full builds.`,
    umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/28138`,
  },
  {
    name: `QUERY_ON_DEMAND`,
    env: `GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND`,
    command: `develop`,
    telemetryId: `QueryOnDemand`,
    description: `Only run queries when needed instead of running all queries upfront. Speeds starting the develop server.`,
    umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/27620`,
    noCi: true,
  },
]

export default activeFlags
