import React from 'react'
import { Router } from 'react-router-dom'
import { Provider } from 'react-redux'

import createStore from './src/state/createStore'

const store = createStore()

export const replaceRouterComponent = ({ history }) => {

    const ConnectedRouterWrapper = ({ children }) => (
        <Provider store={store}>
            <Router history={history}>{children}</Router>
        </Provider>
    )

    return ConnectedRouterWrapper
}
