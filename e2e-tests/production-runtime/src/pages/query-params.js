import React from "react"
import Layout from "../components/layout"
import Seo from "../components/seo"

const QueryParams = ({ location }) => {
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    setSearch(location.search)
  }, [])

  return (
    <Layout>
      <p data-testid="location.search">{search}</p>
    </Layout>
  )
}

export const Head = () => <Seo />

export default QueryParams
