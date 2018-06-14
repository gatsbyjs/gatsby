import React from "react"
import PropTypes from "prop-types"
import Link, { navigateTo } from "gatsby-link"
import pages from "./pages.json"
import loader from "./loader"
import JSONStore from "./json-store"
import { withPrefix } from "./prefix"

const PageRenderer = ({ location }) => {
  const pageResources = loader.getResourcesForPathname(location.pathname)
  return React.createElement(JSONStore, {
    pages,
    location,
    pageResources,
  })
}

PageRenderer.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
}

const StaticQueryContext = React.createContext({})

const StaticQuery = props => (
  <StaticQueryContext.Consumer>
    {staticQueryData => {
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

StaticQuery.propTypes = {
  data: PropTypes.object,
  query: PropTypes.string.isRequired,
  render: PropTypes.func.isRequired,
}

export {
  Link,
  navigateTo,
  withPrefix,
  StaticQueryContext,
  StaticQuery,
  PageRenderer,
}
