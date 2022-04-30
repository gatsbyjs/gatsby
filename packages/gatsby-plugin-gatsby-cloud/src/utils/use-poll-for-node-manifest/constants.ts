export const DEBUG_CONTENT_SYNC_MODE =
  typeof window !== `undefined` &&
  (process.env.GATSBY_DEBUG_CONTENT_SYNC === `true` ||
    !!new URLSearchParams(window.location.search).get(`debug`))
