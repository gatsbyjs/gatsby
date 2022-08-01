import React from "react"
import PropTypes from "prop-types"

// Global private state of static query results
let _staticQueryResults = {}

const _staticQuerySingleton = {
  set(data) {
    _staticQueryResults = data
  },
  get() {
    return _staticQueryResults
  },
}

/**
 * Use this singleton to set and get data for Gatsby's static query components
 */
export const staticQuerySingleton = Object.freeze(_staticQuerySingleton)

const StaticQueryDataRenderer = function StaticQueryDataRenderer({ staticQueryData, data, query, render }) {
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

export const StaticQuery = function StaticQuery({ data, query, render, children }) {
  const staticQueryData = staticQuerySingleton.get()

  return (
    <StaticQueryDataRenderer
      data={data}
      query={query}
      render={render || children}
      staticQueryData={staticQueryData}
    />
  )
}

StaticQuery.propTypes = {
  data: PropTypes.object,
  query: PropTypes.string.isRequired,
  render: PropTypes.func,
  children: PropTypes.func,
}

export const useStaticQuery = query => {
  const staticQueryData = staticQuerySingleton.get()

  // query is a stringified number like `3303882` when wrapped with graphql, If a user forgets
  // to wrap the query in a grqphql, then casting it to a Number results in `NaN` allowing us to
  // catch the misuse of the API and give proper direction
  if (isNaN(Number(query))) {
    throw new Error(`useStaticQuery was called with a string but expects to be called using \`graphql\`. Try this:

import { useStaticQuery, graphql } from 'gatsby';

useStaticQuery(graphql\`${query}\`);
`)
  }

  if (staticQueryData[query]?.data) {
    return staticQueryData[query].data
  } else {
    throw new Error(
      `The result of this StaticQuery could not be fetched.\n\n` +
        `This is likely a bug in Gatsby and if refreshing the page does not fix it, ` +
        `please open an issue in https://github.com/gatsbyjs/gatsby/issues`
    )
  }
}
