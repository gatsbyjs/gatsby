import path from "path"

export const getCacheDir = (root: string): string =>
  path.join(root, `.cache`, `caches`, `gatsby-plugin-image`)
