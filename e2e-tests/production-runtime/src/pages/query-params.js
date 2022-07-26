import React from "react"
import Layout from "../components/layout"

const QueryParams = ({ location }) => {
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    setSearch(location.search)
  }, [])
  
  return (
  <Layout>
    <p data-testid="location.search">{search}</p>
  </Layout>
)}

export default QueryParams
