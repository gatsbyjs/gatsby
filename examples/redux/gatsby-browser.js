import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'

import { Provider } from 'react-redux'
import { createStore } from 'redux'

const reducer = (state, action) => {
    console.log(action)
    if (action.type === `INCREMENT`) {
        return Object.assign({}, state, {
            count: state.count + 1,
        })
    }
    return state
}

const initialState = { count: 0 }

exports.replaceRouterComponent = ({ history }) => {
    const store = createStore(reducer, initialState)

    const ConnectedRouterWrapper = ({ children }) => (
        <Provider store={store}>
            <Router history={history}>{children}</Router>
        </Provider>
    )

    return ConnectedRouterWrapper
}
