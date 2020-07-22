/* @jsx jsx */
import { jsx } from "strict-ui"
import { Spinner } from "theme-ui"
import {
  InstantSearch,
  Configure,
  RefinementList,
  ToggleRefinement,
  connectAutoComplete,
} from "react-instantsearch-dom"
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "gatsby-interface"
import { useMutation } from "urql"

const SearchCombobox: React.FC<{
  onSelect: (value: string) => void
}> = connectAutoComplete(({ hits, currentRefinement, refine, onSelect }) => (
  <Combobox onSelect={onSelect}>
    <ComboboxInput
      sx={{ width: `20em` }}
      aria-labelledby="plugin-search-label"
      onChange={(e): void => refine(e.target.value)}
      value={currentRefinement}
    />
    <ComboboxPopover>
      <ComboboxList aria-labelledby="plugin-search-label">
        {hits.map(hit => (
          <ComboboxOption
            key={hit.objectID}
            selected={false}
            value={hit.name}
          ></ComboboxOption>
        ))}
      </ComboboxList>
    </ComboboxPopover>
  </Combobox>
))

// the search bar holds the Search component in the InstantSearch widget
const PluginSearchInput: React.FC<{}> = () => {
  const [{ fetching }, installGatbyPlugin] = useMutation(`
    mutation installGatsbyPlugin($name: String!) {
      createNpmPackage(npmPackage: {
        name: $name,
        dependencyType: "production"
      }) {
        id
        name
      }
      createGatsbyPlugin(gatsbyPlugin: {
        name: $name
      }) {
        id
        name
      }
    }
  `)

  return (
    <div>
      <InstantSearch
        apiKey="ae43b69014c017e05950a1cd4273f404"
        appId="OFCNCOG2CU"
        indexName="npm-search"
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
        {fetching ? (
          <Spinner />
        ) : (
          <SearchCombobox
            onSelect={(value): void => {
              installGatbyPlugin({ name: value })
            }}
          />
        )}
      </InstantSearch>
    </div>
  )
}

export default PluginSearchInput
