interface IOptionalMatchPath {
  matchPath?: string
}

// Does the following transformations:
//   `/foo/[id]/` => `/foo/:id`
//   `/foo/[...id]/` => `/foo/*id`
//   `/foo/[...]/` => `/foo/*`
export function getMatchPath(srcPagesPath: string): IOptionalMatchPath {
  if (srcPagesPath.includes(`[`) === false) return {}

  return {
    matchPath: srcPagesPath
      .replace(`[...`, `*`)
      .replace(`[`, `:`)
      .replace(`]`, ``)
      .replace(/\/$/, ``),
  }
}
