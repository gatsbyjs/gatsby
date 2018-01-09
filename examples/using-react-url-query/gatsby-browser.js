import React from 'react'
import { Router } from 'react-router-dom'
import { RouterToUrlQuery } from 'react-url-query'

exports.replaceRouterComponent = ({ history }) => {
  /**
   * Wire up the history object using context provided by react-router
   * https://peterbeshai.com/react-url-query/docs/api/RouterToUrlQuery.html
   */
  const ConnectedRouterWrapper = ({ children }) => (
    <Router history={history}>
      <RouterToUrlQuery>
        {children}
      </RouterToUrlQuery>
    </Router>
  )

  return ConnectedRouterWrapper
}
