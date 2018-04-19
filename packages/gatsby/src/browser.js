import React from "react"
import Link, { withPrefix, navigateTo } from "gatsby-link"

const StaticQueryContext = React.createContext({})

const StaticQuery = props => (
  <StaticQueryContext.Consumer>
    {staticQueryData => {
      if (staticQueryData[props.query] && staticQueryData[props.query].data) {
        return props.render(staticQueryData[props.query].data)
      } else {
        return <div>Loading</div>
      }
    }}
  </StaticQueryContext.Consumer>
)

export { Link, withPrefix, navigateTo, StaticQueryContext, StaticQuery }
