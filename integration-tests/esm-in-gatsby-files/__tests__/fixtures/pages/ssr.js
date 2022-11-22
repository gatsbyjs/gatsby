import React from "react"
import { graphql } from "gatsby"

function SSRPage({ data, serverData }) {
  return <pre>{JSON.stringify({ data, serverData }, null, 2)}</pre>
}

export const query = graphql`
  {
    fieldAddedByESMPlugin
  }
`

export const getServerData = () => {
  return {
    props: {
      ssr: true,
    },
  }
}

export default SSRPage
