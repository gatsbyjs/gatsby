// just types - those should not be bundled
import type { GraphQLEngine } from "../../schema/graphql-engine/entry"
import type { IExecutionResult } from "../../query/types"
import type { IGatsbyPage } from "../../redux/types"
import type { IScriptsAndStyles } from "../client-assets-for-template"
// import type { IPageDataWithQueryResult } from "../page-data/write-page-data"

// actual imports
import * as path from "path"
import { writePageData } from "../page-data/write-page-data"
import htmlComponentRenderer from "./render-page"

export interface ITemplateDetails {
  query: string
  staticQueryHashes: Array<string>
  assets: IScriptsAndStyles
}
export interface ISSRData {
  results: IExecutionResult
  page: IGatsbyPage
  templateDetails: ITemplateDetails
}

const pageTemplateDetailsMap: Record<
  string,
  ITemplateDetails
> = INLINED_TEMPLATE_TO_DETAILS

export async function getData({
  pathName,
  graphqlEngine,
}: {
  graphqlEngine: GraphQLEngine
  pathName: string
}): Promise<ISSRData | null> {
  // 1. Find a page for pathname
  const page = graphqlEngine.findPageByPath(pathName)
  if (!page) {
    // page not found, nothing to run query for
    console.log(`Page "${pathName}" not found`)
    return null
  }

  // 2. Lookup query used for a page (template)
  const templateDetails = pageTemplateDetailsMap[page.componentChunkName]
  if (!templateDetails) {
    console.log(
      `couldn't find page template details for "${page.componentChunkName}`
    )
    return null
  }

  // 3. Execute query
  // query-runner handles case when query is not there - so maybe we should consider using that somehow
  let results: IExecutionResult = {}
  if (templateDetails.query) {
    results = await graphqlEngine.runQuery(templateDetails.query, {
      ...page,
      ...page.context,
    })
  }

  results.pageContext = page.context

  return { results, page, templateDetails }
}

export async function getPageData({
  data,
}: {
  data: ISSRData
}): Promise<ReturnType<typeof writePageData>> {
  return writePageData(
    path.join(process.cwd(), `public`),
    {
      componentChunkName: data.page.componentChunkName,
      path: data.page.path,
      matchPath: data.page.matchPath,
      staticQueryHashes: data.templateDetails.staticQueryHashes,
    },
    data.results
  )
}

export async function renderHTML({
  data,
  pageData,
}: {
  data: ISSRData
  pageData?: any
}): Promise<any> {
  if (!pageData) {
    const results = await getPageData({ data })
    pageData = results.body
  }

  return htmlComponentRenderer({
    pagePath: data.page.path,
    pageData,
    staticQueryContext: {}, // TODO: handle static query results map
    ...data.templateDetails.assets,
  })
}
