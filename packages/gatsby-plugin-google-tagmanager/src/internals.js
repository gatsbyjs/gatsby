export const checkIfActive = (
  pathname,
  { includeInDevelopment = false, excludedPaths = [] }
) =>
  (process.env.NODE_ENV === `production` || includeInDevelopment) &&
  (pathname === undefined ||
    !excludedPaths.some(
      excludedPath => pathname.match(excludedPath)?.index >= 0
    ))
