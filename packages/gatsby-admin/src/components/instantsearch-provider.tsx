/* @jsx jsx */
import { jsx } from "strict-ui"
import {
  InstantSearch,
  Configure,
  RefinementList,
  ToggleRefinement,
} from "react-instantsearch-dom"
import algoliaConfig from "../utils/algolia-config"

export default function InstantSearchProvider({
  children,
  searchState,
}: {
  children: React.ReactNode
  searchState?: string
}): JSX.Element {
  return (
    <InstantSearch
      apiKey={algoliaConfig.API_KEY}
      appId={algoliaConfig.APPLICATION_ID}
      indexName="npm-search"
      searchState={searchState}
    >
      <div style={{ display: `none` }}>
        <Configure analyticsTags={[`gatsby-plugins`]} />
        <RefinementList
          attribute="keywords"
          transformItems={(items: Array<any>): Array<any> =>
            items.map(({ count, ...item }) => {
              return {
                ...item,
                count: count || 0,
              }
            })
          }
          defaultRefinement={[`gatsby-component`, `gatsby-plugin`]}
        />
        <ToggleRefinement
          attribute="deprecated"
          value={false}
          label="No deprecated plugins"
          defaultRefinement={true}
        />
      </div>
      {children}
    </InstantSearch>
  )
}
