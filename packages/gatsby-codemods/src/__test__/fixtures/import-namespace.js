import React from "react"
import * as Gatsby from "gatsby"

function SomeComponent(props) {
  return <div />
}

export default SomeComponent

export const query = graphql`
  query {
    allSitePages {
      prefix
    }
  }
`
