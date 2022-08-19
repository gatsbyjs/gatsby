import * as React from "react"
import { graphql } from "gatsby"

const Info = ({ buildTime }: { buildTime?: Queries.SiteInformationFragment["buildTime"] }) => {
  return (
    <p>
      Build time: {buildTime}
    </p>
  )
}

export default Info

export const query = graphql`
  fragment SiteInformation on Site {
    buildTime
  }
`