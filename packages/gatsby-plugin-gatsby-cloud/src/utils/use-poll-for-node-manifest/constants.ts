export const DEBUG_CONTENT_SYNC_MODE =
  true ||
  process.env.GATSBY_DEBUG_CONTENT_SYNC === `true` ||
  (typeof window !== `undefined` &&
    !!new URLSearchParams(window.location.search).get(`debug`))
