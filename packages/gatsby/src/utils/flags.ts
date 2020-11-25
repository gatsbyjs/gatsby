const activeFlags = [
  {
    name: `FAST_DEV`,
    description: `Enable all experiments aimed at improving develop server start time`,
    includedFlags: [`DEV_SSR`, `QUERY_ON_DEMAND`],
  },
  {
    name: `DEV_SSR`,
    description: `SSR pages on full reloads during develop. Helps you detect SSR bugs and fix them without needing to do full builds.`,
  },
  {
    name: `QUERY_ON_DEMAND`,
    description: `Only run queries when needed instead of running all queries upfront. Speeds starting the develop server.`,
  },
]

const allFlags = {
  activeFlags,
}

export default allFlags
