import JestWorker from "jest-worker"
import fs from "fs-extra"
import { joinPath } from "gatsby-core-utils"
import report from "gatsby-cli/lib/reporter"

import { store } from "../../redux"
import { writeModule } from "../gatsby-webpack-virtual-modules"

const startWorker = (): any => {
  const newWorker = new JestWorker(require.resolve(`./render-dev-html-child`), {
    exposedMethods: [`renderHTML`, `deleteModuleCache`, `warmup`],
    enableWorkerThreads: true,
    numWorkers: 1,
    forkOptions: { silent: false },
  })

  newWorker.getStdout().pipe(process.stdout)
  newWorker.getStderr().pipe(process.stderr)

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
  lazySyncRequires += `exports.lazyComponents = {\n${[
    ...pageComponents.values(),
  ]
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
const pageComponentsWritten = new Set()
const inFlightPromises = new Map()

const searchFileForString = (substring, filePath): Promise<boolean> =>
  new Promise(resolve => {
    const stream = fs.createReadStream(filePath)
    let found = false
    stream.on(`data`, function (d) {
      if (d.includes(substring)) {
        found = true
        stream.close()
        resolve(found)
      }
    })
    stream.on(`error`, function () {
      resolve(found)
    })
    stream.on(`close`, function () {
      resolve(found)
    })
  })

const ensurePathComponentInSSRBundle = async (
  path,
  directory
): Promise<any> => {
  const pages = [...store.getState().pages.values()]
  const page = pages.find(p => p.path === path)

  // This shouldn't happen.
  if (!page) {
    report.panic(`page not found`)
  }

  // If we know it's written, return.
  if (pageComponentsWritten.has(page.componentChunkName)) {
    return true
  }

  let promiseResolve
  // If we're already handling this path, return its promise.
  if (inFlightPromises.has(page.componentChunkName)) {
    return inFlightPromises.get(page.componentChunkName)
  } else {
    const promise = new Promise(function (resolve) {
      promiseResolve = resolve
    })

    inFlightPromises.set(page.componentChunkName, promise)
  }

  // Write out the component information to lazy-sync-requires
  pageComponents.set(page.component, {
    component: page.component,
    componentChunkName: page.componentChunkName,
  })
  writeLazyRequires(pageComponents)

  // Now wait for it to be written to public/render-page.js
  const htmlComponentRendererPath = joinPath(directory, `public/render-page.js`)
  const watcher = fs.watch(htmlComponentRendererPath, async () => {
    // This search takes 1-10ms
    const found = await searchFileForString(
      page.componentChunkName,
      htmlComponentRendererPath
    )
    if (found) {
      // It's changed, clean up the watcher.
      watcher.close()
      // Make sure the worker is ready and then resolve.
      worker.deleteModuleCache(htmlComponentRendererPath).then(promiseResolve)
    }
  })

  // We're done, delete the promise from the in-flight promises
  // and add it to the set of done paths.
  inFlightPromises.get(page.componentChunkName).then(() => {
    inFlightPromises.delete(page.componentChunkName)
    pageComponentsWritten.add(page.componentChunkName)
  })

  // Return the promise for the first request.
  return inFlightPromises.get(page.componentChunkName)
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

      const htmlString = await worker.renderHTML({
        path,
        htmlComponentRendererPath,
        directory,
      })
      resolve(htmlString)
    } catch (error) {
      reject(error)
    }
  })
