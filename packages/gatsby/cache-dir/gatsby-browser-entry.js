import React from "react"
import PropTypes from "prop-types"
import Link, {
  withPrefix,
  navigate,
  push,
  replace,
  navigateTo,
} from "gatsby-link"
import { waitForRouteChange } from "./wait-for-route-change"
import PageRenderer from "./public-page-renderer"
import parsePath from "./parse-path"

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

function graphql() {
  throw new Error(
    `It appears like Gatsby is misconfigured. Gatsby related \`graphql\` calls ` +
      `are supposed to only be evaluated at compile time, and then compiled away,. ` +
      `Unfortunately, something went wrong and the query was left in the compiled code.\n\n.` +
      `Unless your site has a complex or custom babel/Gatsby configuration this is likely a bug in Gatsby.`
  )
}

export {
  Link,
  withPrefix,
  graphql,
  parsePath,
  navigate,
  push, // TODO replace for v3
  replace, // TODO remove replace for v3
  navigateTo, // TODO: remove navigateTo for v3
  StaticQueryContext,
  StaticQuery,
  PageRenderer,
  waitForRouteChange,
}
