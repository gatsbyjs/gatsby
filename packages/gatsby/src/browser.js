import React from "react"
import Link, { withPrefix, navigateTo } from "gatsby-link"

const StaticQueryContext = React.createContext({})

const StaticQuery = props => (
  <StaticQueryContext.Consumer>
    {staticQueryData => {
      console.log(props)
      if (
        props.data ||
        (staticQueryData[props.query] && staticQueryData[props.query].data)
      ) {
        return props.render(
          props.data ? props.data.data : staticQueryData[props.query].data
        )
      } else {
        return <div>Loading (StaticQuery)</div>
      }
    }}
  </StaticQueryContext.Consumer>
)

export { Link, withPrefix, navigateTo, StaticQueryContext, StaticQuery }
