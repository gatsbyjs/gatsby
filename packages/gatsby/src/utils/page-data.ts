import fs from "fs-extra"
import path from "path"
import { IGatsbyPage, IDependencyModule } from "../redux/types"
import { websocketManager } from "./websocket-manager"
import { isWebpackStatusPending } from "./webpack-status"
import { store } from "../redux"

import { IExecutionResult } from "../query/types"

interface IPageData {
  componentChunkName: IGatsbyPage["componentChunkName"]
  matchPath?: IGatsbyPage["matchPath"]
  moduleDependencies: string[]
  path: IGatsbyPage["path"]
  staticQueryHashes: string[]
}

interface IPageDataResources {
  staticQueryHashes: Set<string>
  moduleDependencies: Set<string>
}

export interface IPageDataWithQueryResult extends IPageData {
  result: IExecutionResult
}

export function fixedPagePath(pagePath: string): string {
  return pagePath === `/` ? `index` : pagePath
}

function getFilePath(publicDir: string, pagePath: string): string {
  return path.join(
    publicDir,
    `page-data`,
    fixedPagePath(pagePath),
    `page-data.json`
  )
}

export async function readPageData(
  publicDir: string,
  pagePath: string
): Promise<IPageDataWithQueryResult> {
  const filePath = getFilePath(publicDir, pagePath)
  const rawPageData = await fs.readFile(filePath, `utf-8`)

  return JSON.parse(rawPageData)
}

export async function removePageData(
  publicDir: string,
  pagePath: string
): Promise<void> {
  const filePath = getFilePath(publicDir, pagePath)

  if (fs.existsSync(filePath)) {
    return await fs.remove(filePath)
  }

  return Promise.resolve()
}

export function pageDataExists(publicDir: string, pagePath: string): boolean {
  return fs.existsSync(getFilePath(publicDir, pagePath))
}

export async function writePageData(
  publicDir: string,
  {
    componentChunkName,
    matchPath,
    path: pagePath,
    staticQueryHashes,
    moduleDependencies,
  }: IPageData
): Promise<IPageDataWithQueryResult> {
  const inputFilePath = path.join(
    publicDir,
    `..`,
    `.cache`,
    `json`,
    `${pagePath.replace(/\//g, `_`)}.json`
  )
  const outputFilePath = getFilePath(publicDir, pagePath)
  const result = await fs.readJSON(inputFilePath)
  const body = {
    componentChunkName,
    path: pagePath,
    matchPath,
    result,
    staticQueryHashes,
    moduleDependencies,
  }
  const bodyStr = JSON.stringify(body)
  // transform asset size to kB (from bytes) to fit 64 bit to numbers
  const pageDataSize = Buffer.byteLength(bodyStr) / 1000

  store.dispatch({
    type: `ADD_PAGE_DATA_STATS`,
    payload: {
      filePath: outputFilePath,
      size: pageDataSize,
    },
  })

  await fs.outputFile(outputFilePath, bodyStr)
  return body
}

let isFlushPending = false
let isFlushing = false

export function isFlushEnqueued(): boolean {
  return isFlushPending
}

export async function flush(): Promise<void> {
  if (isFlushing) {
    // We're already in the middle of a flush
    return
  }
  isFlushPending = false
  isFlushing = true
  const {
    pendingPageDataWrites,
    components,
    pages,
    program,
    staticQueryComponents,
    modules,
    staticQueriesByTemplate,
    queryModuleDependencies,
  } = store.getState()

  const { pagePaths, templatePaths } = pendingPageDataWrites

  const pathToModules = new Map<string, IDependencyModule>()
  modules.forEach(m => {
    pathToModules.set(m.source, m)
  })

  const pathToHash = new Map<string, string>()
  const hashToStaticQueryId = new Map<string, Set<string>>()
  staticQueryComponents.forEach(({ id, hash, componentPath }) => {
    const key = String(hash)
    let existingSet = hashToStaticQueryId.get(key)
    if (!existingSet) {
      existingSet = new Set<string>()
      hashToStaticQueryId.set(key, existingSet)
    }

    existingSet.add(id)
    pathToHash.set(componentPath, key)
  })

  const pagesToWrite = Array.from(templatePaths).reduce(
    (acc, componentPath) => getPagesUsingStaticQuery(acc, componentPath),
    new Set(pagePaths.values())
  )

  function pickModulesFromStaticQuery(
    staticQueryHash: string,
    resources: IPageDataResources
  ): void {
    const staticQueryIds = hashToStaticQueryId.get(staticQueryHash)
    if (!staticQueryIds) {
      return
    }

    staticQueryIds.forEach(staticQueryId => {
      const modulesUsedByStaticQuery = queryModuleDependencies.current.get(
        staticQueryId
      )

      if (modulesUsedByStaticQuery && modulesUsedByStaticQuery?.size > 0) {
        modulesUsedByStaticQuery.forEach(moduleId => {
          // if this hash was added, don't traverse this path again
          if (!resources.moduleDependencies.has(staticQueryHash)) {
            resources.moduleDependencies.add(moduleId)
            pickStaticQueriesFromModule(moduleId, resources)
          }
        })
      }
    })
  }

  function pickStaticQueriesFromModule(
    moduleId: string,
    resources: IPageDataResources
  ): void {
    const source = modules.get(moduleId)?.source
    if (!source) {
      return
    }

    const staticQueriesUsedByModule = staticQueriesByTemplate.get(source)
    if (staticQueriesUsedByModule && staticQueriesUsedByModule.length > 0) {
      staticQueriesUsedByModule.forEach(staticQueryHash => {
        // if this hash was added, don't traverse this path again
        if (!resources.staticQueryHashes.has(staticQueryHash)) {
          resources.staticQueryHashes.add(staticQueryHash)
          pickModulesFromStaticQuery(staticQueryHash, resources)
        }
      })
    }
  }

  function getPagesUsingStaticQuery(
    set: Set<string>,
    componentPath: string,
    visitedComponentPaths: Set<string> = new Set<string>()
  ): Set<string> {
    if (visitedComponentPaths.has(componentPath)) {
      return set
    } else {
      visitedComponentPaths.add(componentPath)
    }

    const templateComponent = components.get(componentPath)
    if (templateComponent) {
      templateComponent.pages.forEach(set.add.bind(set))
    }

    const staticQueryHash = pathToHash.get(componentPath)
    if (staticQueryHash) {
      staticQueriesByTemplate.forEach(
        (staticQueryHashes, moduleOrTemplatePath) => {
          if (staticQueryHashes.includes(staticQueryHash)) {
            getPagesUsingStaticQuery(
              set,
              moduleOrTemplatePath,
              visitedComponentPaths
            )
          }
        }
      )
    }

    const moduleEntry = pathToModules.get(componentPath)
    if (moduleEntry) {
      // check if this module is used by static query
      // moduleEntry.
      moduleEntry.queryIDs.forEach(usedIn => {
        // static queries that use given module
        if (usedIn.startsWith(`sq--`)) {
          const staticQueryDef = staticQueryComponents.get(usedIn)
          if (!staticQueryDef) {
            return
          }
          const hash = String(staticQueryDef.hash)
          staticQueriesByTemplate.forEach(
            (staticQueryIds, moduleOrTemplatePath) => {
              if (staticQueryIds.includes(hash)) {
                getPagesUsingStaticQuery(
                  set,
                  moduleOrTemplatePath,
                  visitedComponentPaths
                )
              }
            }
          )
        } else {
          // if not static query - it's page path
          set.add(usedIn)
        }
      })
    }

    return set
  }

  for (const pagePath of pagesToWrite) {
    const page = pages.get(pagePath)

    // It's a gloomy day in Bombay, let me tell you a short story...
    // Once upon a time, writing page-data.json files were atomic
    // After this change (#24808), they are not and this means that
    // between adding a pending write for a page and actually flushing
    // them, a page might not exist anymore щ（ﾟДﾟщ）
    // This is why we need this check
    if (page) {
      const resources: IPageDataResources = {
        staticQueryHashes: new Set<string>(),
        moduleDependencies: new Set<string>(),
      }

      const staticQueryForTemplate = staticQueriesByTemplate.get(
        page.componentPath
      )
      const modulesForPage = queryModuleDependencies.current.get(pagePath)

      if (staticQueryForTemplate) {
        staticQueryForTemplate.forEach(staticQueryHash => {
          resources.staticQueryHashes.add(staticQueryHash)
          pickModulesFromStaticQuery(staticQueryHash, resources)
        })
      }

      if (modulesForPage) {
        modulesForPage.forEach(moduleId => {
          resources.moduleDependencies.add(moduleId)
          pickStaticQueriesFromModule(moduleId, resources)
        })
      }

      const staticQueryHashes = Array.from(resources.staticQueryHashes)
      const moduleDependencies = Array.from(resources.moduleDependencies)

      const result = await writePageData(
        path.join(program.directory, `public`),
        {
          ...page,
          staticQueryHashes,
          moduleDependencies,
        }
      )

      if (program?._?.[0] === `develop`) {
        websocketManager.emitPageData({
          id: pagePath,
          result,
        })
      }
    }
  }

  store.dispatch({
    type: `CLEAR_PENDING_PAGE_DATA_WRITES`,
  })
  isFlushing = false
  return
}

export function enqueueFlush(): void {
  if (isWebpackStatusPending()) {
    isFlushPending = true
  } else {
    flush()
  }
}
