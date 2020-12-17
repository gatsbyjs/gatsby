import { graphql, useStaticQuery } from "gatsby"

export function useDataForAddingStaticQueryTest() {
  return useStaticQuery(graphql`
    {
      queryDataCachesJson(
        selector: { eq: "adding-static-query-A-to-B-to-A-link" }
      ) {
        ...QueryDataCachesFragmentInitialPage
      }
    }
  `)
}
