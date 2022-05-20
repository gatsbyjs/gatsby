export const ROUTES_DIRECTORY =
  _CFLAGS_.GATSBY_MAJOR === `4` ? `.cache/page-ssr/routes/` : `public/`

export const isBurstModeEnabled = ({
  firstRun = false,
}: {
  firstRun?: boolean
}): boolean => {
  const GATSBY_PARALLEL_PAGE_GENERATION_ENABLED =
    process.env.GATSBY_PARALLEL_PAGE_GENERATION_ENABLED === `1` ||
    process.env.GATSBY_PARALLEL_PAGE_GENERATION_ENABLED === `true`

  const externalJobsEnabled =
    process.env.ENABLE_GATSBY_EXTERNAL_JOBS === `1` ||
    process.env.ENABLE_GATSBY_EXTERNAL_JOBS === `true`

  return (
    firstRun && GATSBY_PARALLEL_PAGE_GENERATION_ENABLED && externalJobsEnabled
  )
}
