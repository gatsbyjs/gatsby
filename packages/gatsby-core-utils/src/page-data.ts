import path from "path"

export function fixedPagePath(pagePath: string): string {
  return pagePath === `/` ? `index` : pagePath
}

export function generatePageDataPath(
  publicDir: string,
  pagePath: string
): string {
  return path.join(
    publicDir,
    `page-data`,
    fixedPagePath(pagePath),
    `page-data.json`
  )
}
