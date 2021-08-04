// just types - those should not be bundled
import type { GraphQLEngine } from "../../schema/graphql-engine/entry"
import type { IExecutionResult } from "../../query/types"
import type { IGatsbyPage } from "../../redux/types"
import type { IScriptsAndStyles } from "../client-assets-for-template"
import type { IPageDataWithQueryResult } from "../page-data/write-page-data"

// actual imports
import * as path from "path"
import * as fs from "fs-extra"
import { writePageData, fixedPagePath } from "../page-data/write-page-data"
import { getPageHtmlFilePath } from "../page-html"
// @ts-ignore render-page import will become valid later on (it's marked as external)
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
  // @ts-ignore INLINED_TEMPLATE_TO_DETAILS is being "inlined" by bundler
> = INLINED_TEMPLATE_TO_DETAILS

export async function getData({
  pathName,
  graphqlEngine,
}: {
  graphqlEngine: GraphQLEngine
  pathName: string
}): Promise<ISSRData> {
  // 1. Find a page for pathname
  const page = graphqlEngine.findPageByPath(pathName)
  if (!page) {
    // page not found, nothing to run query for
    throw new Error(`Page for "${pathName}" not found`)
  }

  // 2. Lookup query used for a page (template)
  const templateDetails = pageTemplateDetailsMap[page.componentChunkName]
  if (!templateDetails) {
    throw new Error(
      `Page template details for "${page.componentChunkName}" not found`
    )
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

export async function renderPageData({
  data,
}: {
  data: ISSRData
}): Promise<IPageDataWithQueryResult> {
  const results = await writePageData(
    path.join(process.cwd(), `public`),
    {
      componentChunkName: data.page.componentChunkName,
      path: data.page.path,
      matchPath: data.page.matchPath,
      staticQueryHashes: data.templateDetails.staticQueryHashes,
    },
    data.results
  )

  return results.body
}

const outputDir = path.join(process.cwd(), `.cache`, `page-ssr`)

const readStaticQueryContext = async (
  templatePath: string
): Promise<Record<string, any>> => {
  const filePath = path.join(
    outputDir,
    `sq-context`,
    fixedPagePath(templatePath),
    `sq-context.json`
  )
  const rawSQContext = await fs.readFile(filePath, `utf-8`)

  return JSON.parse(rawSQContext)
}

export async function renderHTML({
  data,
  pageData,
}: {
  data: ISSRData
  pageData?: IPageDataWithQueryResult
}): Promise<string> {
  if (!pageData) {
    pageData = await renderPageData({ data })
  }

  const staticQueryContext = await readStaticQueryContext(
    data.page.componentChunkName
  )

  const results = await htmlComponentRenderer({
    pagePath: data.page.path,
    pageData,
    staticQueryContext,
    ...data.templateDetails.assets,
  })

  const outputPath = getPageHtmlFilePath(
    path.join(process.cwd(), `public`),
    data.page.path
  )

  await fs.outputFile(outputPath, results.html)

  return results.html
}
