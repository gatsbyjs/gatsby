/* @jsx jsx */
import { jsx } from "strict-ui"
import React from "react"
import { connectAutoComplete } from "react-instantsearch-dom"
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "gatsby-interface"
import InstantSearchProvider from "./instantsearch-provider"
import { navigate } from "gatsby-link"

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
const PluginSearchInput: React.FC<Record<string, unknown>> = () => (
  <div>
    <InstantSearchProvider>
      <SearchCombobox
        onSelect={(name): void => {
          navigate(`/plugins/${name}`)
        }}
      />
    </InstantSearchProvider>
  </div>
)

export default PluginSearchInput
