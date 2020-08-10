/* @jsx jsx */
import { jsx } from "strict-ui"
import {
  InstantSearch,
  Configure,
  RefinementList,
  ToggleRefinement,
} from "react-instantsearch-dom"

export default function InstantSearchProvider({
  children,
  searchState,
}: {
  children: React.ReactNode
  searchState?: string
}): JSX.Element {
  return (
    <InstantSearch
      apiKey="ae43b69014c017e05950a1cd4273f404"
      appId="OFCNCOG2CU"
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
