import path from "node:path"

export function getCacheDir(root: string): string {
  return path.join(root, `.cache`, `caches`, `gatsby-plugin-image`)
}
