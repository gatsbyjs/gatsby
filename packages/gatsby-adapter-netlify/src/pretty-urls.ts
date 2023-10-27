import fastq from "fastq"
import fs from "fs-extra"

export function generatePrettyUrlFilePath(routePath: string): string {
  if (routePath.endsWith(`/`)) {
    return `${routePath}index.html`
  } else {
    return `${routePath}.html`
  }
}

interface IMoveTask {
  from: string
  to: string
  keepOriginalFile: boolean
}

export function createStaticAssetsPathHandler(): {
  ensureStaticAssetPath: (filePath: string, routePath: string) => string
  fileMovingDone: () => Promise<void>
} {
  const moveQueue = fastq<void, IMoveTask, void>(async (task, cb) => {
    try {
      if (task.keepOriginalFile) {
        await fs.copy(task.from, task.to, { overwrite: true })
      } else {
        await fs.move(task.from, task.to, { overwrite: true })
      }
      cb(null, undefined)
    } catch (error) {
      cb(error)
    }
  }, 2)

  function ensureStaticAssetPath(filePath: string, routePath: string): string {
    const shouldUsePrettyUrl =
      filePath.endsWith(`.html`) && !routePath.endsWith(`.html`)

    const expectedPath = `public${
      shouldUsePrettyUrl ? generatePrettyUrlFilePath(routePath) : routePath
    }`

    if (expectedPath !== filePath) {
      moveQueue.push({
        from: filePath,
        to: expectedPath,
        // 404.html should stay in root of PUBLISH_DIR to be used as custom 404 page
        // both 404.html and 500.html should stay in root of PUBLISH_DIR to be bundled correctly for SSR/DSG
        keepOriginalFile:
          filePath === `public/404.html` || filePath === `public/500.html`,
      })
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
