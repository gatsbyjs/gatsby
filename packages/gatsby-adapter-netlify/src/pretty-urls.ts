// import fastq from "fastq"
import fs from "fs-extra"

function generateFilePathForStaticRoute(
  routePath: string,
  shouldUsePrettyUrl: boolean
): string {
  if (shouldUsePrettyUrl) {
    if (routePath.endsWith(`.html`)) {
      return routePath
    } else if (routePath === `/`) {
      return `/index.html`
    } else if (routePath.endsWith(`/`)) {
      return `${routePath}index.html`
    } else {
      return `${routePath}.html`
    }
  }
  return routePath
}

export function createStaticAssetsPathHandler(): any {
  const promises: Array<Promise<any>> = []
  function ensureStaticAssetPath(filePath: string, routePath: string): string {
    const shouldUsePrettyUrl = filePath.endsWith(`.html`)
    // if (shouldUsePrettyUrl) {
    const expectedPath = `public${generateFilePathForStaticRoute(
      routePath,
      shouldUsePrettyUrl
    )}`

    if (expectedPath !== filePath) {
      console.log(`pathDiff`, {
        expectedPath,
        filePath,
        routePath,
      })
      const p = fs.move(filePath, expectedPath)
      promises.push(p)
    }
    // }
    //
    return filePath
  }

  const fileMovingDone = (): Promise<void> =>
    Promise.all(promises).then(() => undefined)

  return {
    ensureStaticAssetPath,
    fileMovingDone,
  }
}
