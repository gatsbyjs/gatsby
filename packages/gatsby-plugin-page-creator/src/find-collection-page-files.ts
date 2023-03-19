import glob from "globby"

export const pagesGlob = `**/**\\{*\\}**(/**)`

export const findCollectionPageFiles = (
  pagesPath: string
): Promise<Array<string>> => glob(pagesGlob, { cwd: pagesPath })
