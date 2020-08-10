/* @jsx jsx */
import { jsx } from "strict-ui"
import { Spinner } from "theme-ui"
import { connectAutoComplete } from "react-instantsearch-dom"
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "gatsby-interface"
import { useMutation } from "urql"
import InstantSearchProvider from "./instantsearch-provider"

const SearchCombobox: React.FC<{
  onSelect: (value: string) => void
}> = connectAutoComplete(({ hits, currentRefinement, refine, onSelect }) => (
  <Combobox onSelect={onSelect}>
    <ComboboxInput
      aria-labelledby="plugin-search-label"
      onChange={(e): void => refine(e.target.value)}
      value={currentRefinement}
      placeholder="What are you looking for?"
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
      <InstantSearchProvider>
        {fetching ? (
          <Spinner />
        ) : (
          <SearchCombobox
            onSelect={(value): void => {
              installGatbyPlugin({ name: value })
            }}
          />
        )}
      </InstantSearchProvider>
    </div>
  )
}

export default PluginSearchInput
