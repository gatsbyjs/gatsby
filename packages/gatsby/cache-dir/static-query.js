import React from "react"
import PropTypes from "prop-types"

const StaticQueryContext = React.createContext({})
let _StaticQueryServerContext = null
if (React.createServerContext) {
  _StaticQueryServerContext = createServerContext(`StaticQuery`, {})
}

function createServerOrClientContext(name, defaultValue) {
  if (React.createServerContext) return createServerContext(name, defaultValue)
  else return React.createContext(defaultValue)
}

// Ensure serverContext is not created more than once as React will throw when creating it more than once
// https://github.com/facebook/react/blob/dd2d6522754f52c70d02c51db25eb7cbd5d1c8eb/packages/react/src/ReactServerContext.js#L101
function createServerContext(name, defaultValue) {
  if (!global.__GATSBY_SERVER_CONTEXT__) {
    global.__GATSBY_SERVER_CONTEXT__ = {}
  }

  if (!global.__GATSBY_SERVER_CONTEXT__[name]) {
    global.__GATSBY_SERVER_CONTEXT__[name] = React.createServerContext(
      name,
      defaultValue
    )
  }

  return global.__GATSBY_SERVER_CONTEXT__[name]
}

function getClientOrServerContext() {
  if (
    _StaticQueryServerContext &&
    Object.keys(_StaticQueryServerContext._currentValue).length
  ) {
    return _StaticQueryServerContext
  } else {
    return StaticQueryContext
  }
}

function StaticQueryDataRenderer({ staticQueryData, data, query, render }) {
  const finalData = data
    ? data.data
    : staticQueryData[query] && staticQueryData[query].data

  return (
    <React.Fragment>
      {finalData && render(finalData)}
      {!finalData && <div>Loading (StaticQuery)</div>}
    </React.Fragment>
  )
}

// TODO(v5): Remove completely
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

StaticQuery.propTypes = {
  data: PropTypes.object,
  query: PropTypes.string.isRequired,
  render: PropTypes.func,
  children: PropTypes.func,
}

const useStaticQuery = query => {
  if (
    typeof React.useContext !== `function` &&
    process.env.NODE_ENV === `development`
  ) {
    // TODO(v5): Remove since we require React >= 18
    throw new Error(
      `You're likely using a version of React that doesn't support Hooks\n` +
        `Please update React and ReactDOM to 16.8.0 or later to use the useStaticQuery hook.`
    )
  }
  const contextToUse = getClientOrServerContext()
  const context = React.useContext(contextToUse)

  // query is a stringified number like `3303882` when wrapped with graphql, If a user forgets
  // to wrap the query in a grqphql, then casting it to a Number results in `NaN` allowing us to
  // catch the misuse of the API and give proper direction
  if (isNaN(Number(query))) {
    throw new Error(`useStaticQuery was called with a string but expects to be called using \`graphql\`. Try this:

import { useStaticQuery, graphql } from 'gatsby';

useStaticQuery(graphql\`${query}\`);
`)
  }

  if (context[query]?.data) {
    return context[query].data
  } else {
    throw new Error(
      `The result of this StaticQuery could not be fetched.\n\n` +
        `This is likely a bug in Gatsby and if refreshing the page does not fix it, ` +
        `please open an issue in https://github.com/gatsbyjs/gatsby/issues`
    )
  }
}
const StaticQueryServerContext = _StaticQueryServerContext || StaticQueryContext

export {
  StaticQuery,
  StaticQueryContext,
  useStaticQuery,
  StaticQueryServerContext,
  createServerOrClientContext,
}
