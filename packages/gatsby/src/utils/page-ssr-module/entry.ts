import type { GraphQLEngine } from "../../schema/graphql-engine/entry"

export async function getData({
  pathName,
  graphqlEngine,
}: {
  graphqlEngine: GraphQLEngine
  pathName: string
}): Promise<any> {
  // 1. Find a page for pathname
  const page = graphqlEngine.findPageByPath(pathName)
  if (!page) {
    // page not found, nothing to run query for
    console.log(`Page "${pathName}" not found`)
    return null
  }

  // 2. Lookup query used for a page (template)
  const pageTemplateDetails =
    INLINED_TEMPLATE_TO_DETAILS[page.componentChunkName]
  if (!pageTemplateDetails) {
    console.log(
      `couldn't find page template details for "${page.componentChunkName}`
    )
    return null
  }

  // 3. Execute query

  // query-runner handles case when query is not there - so maybe we should consider using that somehow
  let results = {}
  if (pageTemplateDetails.query) {
    results = await graphqlEngine.runQuery(pageTemplateDetails.query, {
      ...page,
      ...page.context,
    })
  }

  results.pageContext = page.context

  return results
}
