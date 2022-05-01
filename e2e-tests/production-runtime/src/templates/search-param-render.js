import * as React from "react"

const SearchParam = ({ location }) => (
  <pre data-testid="search-marker">{location.search}</pre>
)

export default SearchParam
