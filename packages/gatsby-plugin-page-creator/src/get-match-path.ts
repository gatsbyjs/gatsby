interface IOptionalMatchPath {
  matchPath?: string
}

// Does the following transformations:
//   `/foo/[id]/` => `/foo/:id`
//   `/foo/[...id]/` => `/foo/*id`
//   `/foo/[...]/` => `/foo/*`
export function getMatchPath(srcPagesPath: string): IOptionalMatchPath {
  if (srcPagesPath.includes(`[`) === false) return {}
  const startRegex = /\[/g
  const endRegex = /\]/g
  const splatRegex = /\[\.\.\./g

  return {
    matchPath: srcPagesPath
      .replace(splatRegex, `*`)
      .replace(startRegex, `:`)
      .replace(endRegex, ``)
      .replace(/\/$/, ``),
  }
}
