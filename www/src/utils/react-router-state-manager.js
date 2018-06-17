import React from 'react'
import queryString from "query-string"

// https://gist.github.com/sw-yx/efd9ee71669413bca6a895d87e30742f

export default defaultURLState => Component => props => {
  const { history, location } = props
  const urlState = { ...defaultURLState, ...queryString.parse(location.search) }
  const setURLState = newState => {
    const finalState = { ...urlState, ...newState }
    Object.keys(newState).forEach(function (k) {
      if (!finalState[k]) {
        delete finalState[k]; // drop query params with new values = false
      }
    });
    return history.push({ search: `?${queryString.stringify(finalState)}` })
  }
  return <Component
    setURLState={setURLState}
    urlState={urlState}
    {...props}
  />
}
