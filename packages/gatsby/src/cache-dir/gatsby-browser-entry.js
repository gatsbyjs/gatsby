import React from "react"
import PropTypes from "prop-types"
import Link, { withPrefix, push, replace, navigateTo } from "gatsby-link"
import PageRenderer from "./public-page-renderer"

const StaticQueryContext = React.createContext({})

const StaticQuery = props => (
  <StaticQueryContext.Consumer>
    {staticQueryData => {
      if (
        props.data ||
        (staticQueryData[props.query] && staticQueryData[props.query].data)
      ) {
        return (props.render || props.children)(
          props.data ? props.data.data : staticQueryData[props.query].data
        )
      } else {
        return <div>Loading (StaticQuery)</div>
      }
    }}
  </StaticQueryContext.Consumer>
)

StaticQuery.propTypes = {
  data: PropTypes.object,
  query: PropTypes.string.isRequired,
  render: PropTypes.func,
  children: PropTypes.func,
}

export {
  Link,
  withPrefix,
  push,
  replace,
  navigateTo, // TODO: remove navigateTo for v3
  StaticQueryContext,
  StaticQuery,
  PageRenderer,
}
