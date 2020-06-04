interface IOptionalMatchPath {
  matchPath?: string
}

export function getMatchPath(srcPagesPath: string): IOptionalMatchPath {
  if (srcPagesPath.includes(`[`) === false) return {}

  // Does the following transformations:
  //   `/foo/[id]/` => `/foo/:id`
  //   `/foo/[...id]/` => `/foo/*id`
  //   `/foo/[...]/` => `/foo/*`
  return {
    matchPath: srcPagesPath
      .replace(`[...`, `*`)
      .replace(`[`, `:`)
      .replace(`]`, ``)
      .replace(/\/$/, ``),
  }
}
