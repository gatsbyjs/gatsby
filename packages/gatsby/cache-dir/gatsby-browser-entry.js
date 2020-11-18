import React from "react"
import PropTypes from "prop-types"
import Link, {
  withPrefix,
  withAssetPrefix,
  navigate,
  push,
  replace,
  navigateTo,
  parsePath,
} from "gatsby-link"
import { useScrollRestoration } from "gatsby-react-router-scroll"
import PageRenderer from "./public-page-renderer"
import loader, { getStaticQueryResults } from "./loader"

const prefetchPathname = loader.enqueue

const StaticQueryContext = React.createContext({})

function StaticQueryDataRenderer({ staticQueryData, data, query, render }) {
  let combinedStaticQueryData = staticQueryData

  if (process.env.GATSBY_EXPERIMENTAL_LAZY_DEVJS) {
    // when we remove the flag, we don't need to combine them
    // w/ changes @pieh made.
    combinedStaticQueryData = {
      ...getStaticQueryResults(),
      ...staticQueryData,
    }
  }

  const finalData = data
    ? data.data
    : combinedStaticQueryData[query] && combinedStaticQueryData[query].data

  return (
    <React.Fragment>
      {finalData && render(finalData)}
      {!finalData && <div>Loading (StaticQuery)</div>}
    </React.Fragment>
  )
}

const StaticQuery = props => {
  const { data, query, render, children } = props

  return (
    <StaticQueryContext.Consumer>
      {staticQueryData => (
        <StaticQueryDataRenderer
          data={data}
          query={query}
          render={render || children}
          staticQueryData={staticQueryData}
        />
      )}
    </StaticQueryContext.Consumer>
  )
}

const useStaticQuery = query => {
  if (
    typeof React.useContext !== `function` &&
    process.env.NODE_ENV === `development`
  ) {
    throw new Error(
      `You're likely using a version of React that doesn't support Hooks\n` +
        `Please update React and ReactDOM to 16.8.0 or later to use the useStaticQuery hook.`
    )
  }
  const context = React.useContext(StaticQueryContext)

  // query is a stringified number like `3303882` when wrapped with graphql, If a user forgets
  // to wrap the query in a grqphql, then casting it to a Number results in `NaN` allowing us to
  // catch the misuse of the API and give proper direction
  if (isNaN(Number(query))) {
    throw new Error(`useStaticQuery was called with a string but expects to be called using \`graphql\`. Try this:

import { useStaticQuery, graphql } from 'gatsby';

useStaticQuery(graphql\`${query}\`);
`)
  }

  let queryNotFound = false
  if (process.env.GATSBY_EXPERIMENTAL_LAZY_DEVJS) {
    // Merge data loaded via socket.io & xhr
    // when we remove the flag, we don't need to combine them
    // w/ changes @pieh made.
    const staticQueryData = {
      ...getStaticQueryResults(),
      ...context,
    }
    if (staticQueryData[query]?.data) {
      return staticQueryData[query].data
    } else {
      queryNotFound = true
    }
  } else {
    if (context[query]?.data) {
      return context[query].data
    } else {
      queryNotFound = true
    }
  }

  if (queryNotFound) {
    throw new Error(
      `The result of this StaticQuery could not be fetched.\n\n` +
        `This is likely a bug in Gatsby and if refreshing the page does not fix it, ` +
        `please open an issue in https://github.com/gatsbyjs/gatsby/issues`
    )
  }

  return null
}

StaticQuery.propTypes = {
  data: PropTypes.object,
  query: PropTypes.string.isRequired,
  render: PropTypes.func,
  children: PropTypes.func,
}

function graphql() {
  throw new Error(
    `It appears like Gatsby is misconfigured. Gatsby related \`graphql\` calls ` +
      `are supposed to only be evaluated at compile time, and then compiled away. ` +
      `Unfortunately, something went wrong and the query was left in the compiled code.\n\n` +
      `Unless your site has a complex or custom babel/Gatsby configuration this is likely a bug in Gatsby.`
  )
}

export {
  Link,
  withAssetPrefix,
  withPrefix,
  graphql,
  parsePath,
  navigate,
  push, // TODO replace for v3
  replace, // TODO remove replace for v3
  navigateTo, // TODO: remove navigateTo for v3
  useScrollRestoration,
  StaticQueryContext,
  StaticQuery,
  PageRenderer,
  useStaticQuery,
  prefetchPathname,
}
