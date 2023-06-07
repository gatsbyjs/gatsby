import type { GatsbyFunctionResponse, GatsbyFunctionRequest } from "gatsby"
import * as path from "path"
import * as fs from "fs-extra"
import { tmpdir } from "os"
import type { IGatsbyPage } from "../../internal"
import type { ISSRData } from "./entry"
import { link } from "linkfs"

function setupFsWrapper(): string {
  // setup global._fsWrapper
  try {
    fs.accessSync(__filename, fs.constants.W_OK)
    // TODO: this seems funky - not sure if this is correct way to handle this, so just marking TODO to revisit this
    return path.join(__dirname, `..`, `data`, `datastore`)
  } catch (e) {
    // we are in a read-only filesystem, so we need to use a temp dir

    const TEMP_CACHE_DIR = path.join(tmpdir(), `gatsby`, `.cache`)

    // TODO: don't hardcode this
    const cacheDir = `/var/task/.cache`

    // we need to rewrite fs
    const rewrites = [
      [path.join(cacheDir, `caches`), path.join(TEMP_CACHE_DIR, `caches`)],
      [
        path.join(cacheDir, `caches-lmdb`),
        path.join(TEMP_CACHE_DIR, `caches-lmdb`),
      ],
      [path.join(cacheDir, `data`), path.join(TEMP_CACHE_DIR, `data`)],
    ]

    console.log(`Preparing Gatsby filesystem`, {
      from: cacheDir,
      to: TEMP_CACHE_DIR,
      rewrites,
    })
    // Alias the cache dir paths to the temp dir
    const lfs = link(fs, rewrites) as typeof import("fs")

    // linkfs doesn't pass across the `native` prop, which graceful-fs needs
    for (const key in lfs) {
      if (Object.hasOwnProperty.call(fs[key], `native`)) {
        lfs[key].native = fs[key].native
      }
    }

    const dbPath = path.join(TEMP_CACHE_DIR, `data`, `datastore`)

    // 'promises' is not initially linked within the 'linkfs'
    // package, and is needed by underlying Gatsby code (the
    // @graphql-tools/code-file-loader)
    lfs.promises = link(fs.promises, rewrites)

    // Gatsby uses this instead of fs if present
    // eslint-disable-next-line no-underscore-dangle
    global._fsWrapper = lfs

    const dir = `data`
    if (
      !process.env.NETLIFY_LOCAL &&
      fs.existsSync(path.join(TEMP_CACHE_DIR, dir))
    ) {
      console.log(`directory already exists`)
      return dbPath
    }
    console.log(`Start copying ${dir}`)

    fs.copySync(path.join(cacheDir, dir), path.join(TEMP_CACHE_DIR, dir))
    console.log(`End copying ${dir}`)

    return dbPath
  }
}

const dbPath = setupFsWrapper()

// using require instead of import here for now because of type hell + import path doesn't exist in current context
// as this file will be copied elsewhere

const { GraphQLEngine } =
  require(`../query-engine`) as typeof import("../../schema/graphql-engine/entry")

const { getData, renderPageData, renderHTML } =
  require(`./index`) as typeof import("./entry")

const graphqlEngine = new GraphQLEngine({
  dbPath,
})

function reverseFixedPagePath(pageDataRequestPath: string): string {
  return pageDataRequestPath === `index` ? `/` : pageDataRequestPath
}

function getPathInfo(req: GatsbyFunctionRequest):
  | {
      isPageData: boolean
      pagePath: string
    }
  | undefined {
  // @ts-ignore GatsbyFunctionRequest.path is not in types ... there is no property in types that can be used to get a path currently
  const matches = req.url.matchAll(/^\/?page-data\/(.+)\/page-data.json$/gm)
  for (const [, requestedPagePath] of matches) {
    return {
      isPageData: true,
      pagePath: reverseFixedPagePath(requestedPagePath),
    }
  }

  // if not matched
  return {
    isPageData: false,
    // @ts-ignore GatsbyFunctionRequest.path is not in types ... there is no property in types that can be used to get a path currently
    pagePath: req.url,
  }
}

function setStatusAndHeaders({
  page,
  data,
  res,
}: {
  page: IGatsbyPage
  data: ISSRData
  res: GatsbyFunctionResponse
}): void {
  if (page.mode === `SSR`) {
    if (data.serverDataStatus) {
      res.status(data.serverDataStatus)
    }
    if (data.serverDataHeaders) {
      for (const [name, value] of Object.entries(data.serverDataHeaders)) {
        res.setHeader(name, value)
      }
    }
  }
}

async function engineHandler(
  req: GatsbyFunctionRequest,
  res: GatsbyFunctionResponse
): Promise<void> {
  try {
    const pathInfo = getPathInfo(req)
    if (!pathInfo) {
      res.status(404).send(`Not found`)
      return
    }

    const { isPageData, pagePath } = pathInfo

    const page = graphqlEngine.findPageByPath(pagePath)
    if (!page) {
      res.status(404).send(`Not found`)
      return
    }

    const data = await getData({
      pathName: pagePath,
      graphqlEngine,
      req,
    })

    if (isPageData) {
      const results = await renderPageData({ data })
      setStatusAndHeaders({ page, data, res })
      res.json(results)
      return
    } else {
      const results = await renderHTML({ data })
      setStatusAndHeaders({ page, data, res })
      res.send(results)
      return
    }
  } catch (e) {
    console.error(`Engine failed to handle request`, e)
    res.status(500).send(`Internal server error.`)
  }
}

export default engineHandler
