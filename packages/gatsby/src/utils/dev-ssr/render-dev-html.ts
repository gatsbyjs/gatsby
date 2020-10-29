import JestWorker from "jest-worker"
import fs from "fs-extra"
import { joinPath } from "gatsby-core-utils"

import { store } from "../../redux"
import { writeModule } from "../gatsby-webpack-virtual-modules"

const startWorker = (): any => {
  const newWorker = new JestWorker(require.resolve(`./render-dev-html-child`), {
    exposedMethods: [`renderHTML`, `deleteModuleCache`, `warmup`],
    numWorkers: 1,
    enableWorkerThreads: true,
  })

  // jest-worker is lazy with forking but we want to fork immediately so the user
  // doesn't have to wait.
  // @ts-ignore
  newWorker.warmup()

  return newWorker
}

let worker
export const initDevWorkerPool = (): void => {
  worker = startWorker()
}

let changeCount = 0
export const restartWorker = (htmlComponentRendererPath): void => {
  changeCount += 1
  // Forking is expensive — each time we re-require the outputted webpack
  // file, memory grows ~10 mb — 25 regenerations means ~250mb which seems
  // like an accepatable amount of memory to grow before we reclaim it
  // by rebooting the worker process.
  if (changeCount > 25) {
    const oldWorker = worker
    const newWorker = startWorker()
    worker = newWorker
    oldWorker.end()
    changeCount = 0
  } else {
    worker.deleteModuleCache(htmlComponentRendererPath)
  }
}

interface IGatsbyPageComponent {
  component: string
  componentChunkName: string
}

// TODO: Remove all "hot" references in this `syncRequires` variable when fast-refresh is the default
const hotImport =
  process.env.GATSBY_HOT_LOADER !== `fast-refresh`
    ? `const { hot } = require("react-hot-loader/root")`
    : ``
const hotMethod = process.env.GATSBY_HOT_LOADER !== `fast-refresh` ? `hot` : ``

const writeLazyRequires = (pageComponents): void => {
  // Create file with sync requires of components/json files.
  let lazySyncRequires = `${hotImport}

// prefer default export if available
const preferDefault = m => (m && m.default) || m
\n\n`
  lazySyncRequires += `exports.components = {\n${[...pageComponents.values()]
    .map(
      (c: IGatsbyPageComponent): string =>
        `  "${
          c.componentChunkName
        }": ${hotMethod}(preferDefault(require("${joinPath(c.component)}")))`
    )
    .join(`,\n`)}
}\n\n`

  writeModule(`$virtual/lazy-sync-requires`, lazySyncRequires)
}

const pageComponents = new Map()
const ensurePathComponentInSSRBundle = async (path, directory): void => {
  const pages = [...store.getState().pages.values()]
  const { component, componentChunkName } = pages.find(p => p.path === path)
  if (!pageComponents.has(component)) {
    pageComponents.set(component, { component, componentChunkName })
    await writeLazyRequires(pageComponents)
    const htmlComponentRendererPath = joinPath(
      directory,
      `public/render-page.js`
    )
    await new Promise(async resolve => {
      const watcher = fs.watch(htmlComponentRendererPath, () => {
        // It's changed, clean up the watcher.
        watcher.close()
        // Make sure the worker is ready.
        await worker.deleteModuleCache(htmlComponentRendererPath)
        resolve()
      })
    })
  }
  // else nothing to do so we return.
}

// Initialize the virtual module.
writeLazyRequires(pageComponents)

export const renderDevHTML = ({
  path,
  htmlComponentRendererPath,
  directory,
}): Promise<string> =>
  new Promise(async (resolve, reject) => {
    try {
      // Write component to file & wait for public/render-page.js to update
      await ensurePathComponentInSSRBundle(path, directory)

      const response = await worker.renderHTML({
        path,
        htmlComponentRendererPath,
        directory,
      })
      resolve(response)
    } catch (error) {
      reject(error)
    }
  })
