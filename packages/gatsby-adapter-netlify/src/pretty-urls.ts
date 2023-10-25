import fastq from "fastq"
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

interface IMoveTask {
  from: string
  to: string
}

export function createStaticAssetsPathHandler(): {
  ensureStaticAssetPath: (filePath: string, routePath: string) => string
  fileMovingDone: () => Promise<void>
} {
  const moveQueue = fastq<void, IMoveTask, void>(async (task, cb) => {
    try {
      await fs.move(task.from, task.to)
      cb(null, undefined)
    } catch (error) {
      cb(error)
    }
  }, 2)

  function ensureStaticAssetPath(filePath: string, routePath: string): string {
    const shouldUsePrettyUrl = filePath.endsWith(`.html`)

    const expectedPath = `public${generateFilePathForStaticRoute(
      routePath,
      shouldUsePrettyUrl
    )}`

    if (expectedPath !== filePath) {
      moveQueue.push({ from: filePath, to: expectedPath })
    }
    return filePath
  }

  const fileMovingDone = (): Promise<void> => {
    if (moveQueue.idle()) {
      return Promise.resolve()
    }
    return new Promise(resolve => {
      moveQueue.drain = resolve
    })
  }

  return {
    ensureStaticAssetPath,
    fileMovingDone,
  }
}
