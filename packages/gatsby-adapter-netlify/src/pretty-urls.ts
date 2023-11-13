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

export function normalizeDynamicRoutePath(routePath: string): string {
  return (
    routePath
      // replace `:param` with `[param]`
      .replace(/:([^:/\\]+)/gm, `[$1]`)
      // replace `*param` with `[...param]` and `*` with `[...]`
      .replace(/\*([^:/\\]*)/gm, `[...$1]`)
  )
}

export function createStaticAssetsPathHandler(): {
  ensureStaticAssetPath: (
    filePath: string,
    routePath: string
  ) => { finalFilePath: string; isDynamic: boolean }
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

  function ensureStaticAssetPath(
    filePath: string,
    routePath: string
  ): { finalFilePath: string; isDynamic: boolean } {
    const shouldUsePrettyUrl =
      filePath.endsWith(`.html`) && !routePath.endsWith(`.html`)

    let isDynamic = false
    // dynamic routes syntax use characters that are reserved in a lot of filesystems
    // so if route is dynamic we should normalize filepath
    if (routePath.includes(`:`) || routePath.includes(`*`)) {
      routePath = normalizeDynamicRoutePath(routePath)
      isDynamic = true
    }

    const finalFilePath = `public${
      shouldUsePrettyUrl ? generatePrettyUrlFilePath(routePath) : routePath
    }`

    if (finalFilePath !== filePath) {
      moveQueue.push({
        from: filePath,
        to: finalFilePath,
        // 404.html should stay in root of PUBLISH_DIR to be used as custom 404 page
        // both 404.html and 500.html should stay in root of PUBLISH_DIR to be bundled correctly for SSR/DSG
        keepOriginalFile:
          filePath === `public/404.html` || filePath === `public/500.html`,
      })
    }
    return {
      finalFilePath,
      isDynamic,
    }
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
