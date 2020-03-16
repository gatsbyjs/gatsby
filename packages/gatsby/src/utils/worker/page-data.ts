import path from "path"

export const getFilePath = (
  { publicDir }: { publicDir: string },
  pagePath: string
): string => {
  const fixedPagePath = pagePath === `/` ? `index` : pagePath
  return path.join(publicDir, `page-data`, fixedPagePath, `page-data.json`)
}
