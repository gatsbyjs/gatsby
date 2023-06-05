import { GatsbyFunctionResponse, GatsbyFunctionRequest } from "gatsby"
import * as path from "path"
import { IGatsbyPage } from "../../internal"
import { ISSRData } from "./entry"

// using require instead of import here for now because of type hell + import path doesn't exist in current context
// as this file will be copied elsewhere

const { GraphQLEngine } =
  require(`../query-engine`) as typeof import("../../schema/graphql-engine/entry")

const { getData, renderPageData, renderHTML } =
  require(`./index`) as typeof import("./entry")

const graphqlEngine = new GraphQLEngine({
  dbPath: path.join(__dirname, `..`, `data`, `datastore`),
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
