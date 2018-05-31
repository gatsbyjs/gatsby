import React from "react"
import Link, { withPrefix, navigateTo } from "gatsby-link"
import pages from "./pages.json"
import loader from "./loader"
import JSONStore from "./json-store"

const PageRenderer = ({ location }) => {
  const pageResources = loader.getResourcesForPathname(location.pathname)
  const isPage = !!(pageResources && pageResources.component)
  return React.createElement(JSONStore, {
    pages,
    location,
    pageResources,
  })
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

export {
  Link,
  withPrefix,
  navigateTo,
  StaticQueryContext,
  StaticQuery,
  PageRenderer,
}
