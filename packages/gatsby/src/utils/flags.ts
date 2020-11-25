const activeFlags = [
  {
    name: `FAST_DEV`,
    env: `GATSBY_EXPERIMENTAL_FAST_DEV`,
    description: `Enable all experiments aimed at improving develop server start time`,
    includedFlags: [`DEV_SSR`, `QUERY_ON_DEMAND`],
  },
  {
    name: `DEV_SSR`,
    env: `GATSBY_EXPERIMENTAL_DEV_SSR`,
    description: `SSR pages on full reloads during develop. Helps you detect SSR bugs and fix them without needing to do full builds.`,
    umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/28138`,
  },
  {
    name: `QUERY_ON_DEMAND`,
    env: `GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND`,
    description: `Only run queries when needed instead of running all queries upfront. Speeds starting the develop server.`,
    umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/27620`,
    noCi: true,
  },
]

const allFlags = {
  activeFlags,
}

export default allFlags
