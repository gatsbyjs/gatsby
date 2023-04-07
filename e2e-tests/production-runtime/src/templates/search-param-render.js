import * as React from "react"

const SearchParam = ({ location }) => {
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    setSearch(location.search)
  }, [])

  return (
    <pre data-testid="search-marker">{search}</pre>
  )
}

export default SearchParam
