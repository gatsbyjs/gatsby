import JestWorker from "jest-worker"
import fs from "fs-extra"
import { joinPath } from "gatsby-core-utils"
import report from "gatsby-cli/lib/reporter"
import _ from "lodash"

import { startListener } from "../../bootstrap/requires-writer"
import { findPageByPath } from "../find-page-by-path"
import { boundActionCreators } from "../../redux/actions"
const { createSSRVisitedPage } = boundActionCreators

const startWorker = (): any => {
  const newWorker = new JestWorker(require.resolve(`./render-dev-html-child`), {
    exposedMethods: [`renderHTML`, `deleteModuleCache`, `warmup`],
    numWorkers: 1,
    forkOptions: { silent: false },
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
  page,
  directory
): Promise<any> => {
  // This shouldn't happen.
  if (!page) {
    report.panic(`page not found`)
  }

  // Now check if it's written to public/render-page.js
  const htmlComponentRendererPath = joinPath(directory, `public/render-page.js`)
  // This search takes 1-10ms
  // We do it as there can be a race conditions where two pages
  // are requested at the same time which means that both are told render-page.js
  // has changed when the first page is complete meaning the second
  // page's component won't be in the render meaning its SSR will fail.
  let found = await searchFileForString(
    page.componentChunkName,
    htmlComponentRendererPath
  )

  if (!found) {
    await new Promise(resolve => {
      let readAttempts = 0
      const searchForStringInterval = setInterval(async () => {
        readAttempts += 1
        found = await searchFileForString(
          page.componentChunkName,
          htmlComponentRendererPath
        )
        if (found || readAttempts === 5) {
          clearInterval(searchForStringInterval)
          resolve()
        }
      }, 300)
    })
  }

  return found
}

export const renderDevHTML = ({
  path,
  page,
  store,
  htmlComponentRendererPath,
  directory,
}): Promise<string> =>
  new Promise(async (resolve, reject) => {
    startListener()
    let pageObj
    if (!page) {
      pageObj = findPageByPath(store.getState(), path)
    } else {
      pageObj = page
    }

    // Record this page was requested. This will kick off adding its page
    // component to the ssr bundle (if that's not already happened)
    createSSRVisitedPage(pageObj)

    let pageFound = true
    if (process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
      // Write component to file & wait for public/render-page.js to update
      pageFound = await ensurePathComponentInSSRBundle(pageObj, directory)
      if (!pageFound) {
        reject(`404 page`)
      }
    }

    if (pageFound) {
      try {
        const htmlString = await worker.renderHTML({
          path,
          htmlComponentRendererPath,
          directory,
        })
        resolve(htmlString)
      } catch (error) {
        reject(error)
      }
    }
  })
