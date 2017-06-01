import React from 'react'
import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'

import createStore from './src/state/createStore'

exports.replaceServerBodyRender = ({ component: body }) => {

    const store = createStore()

    const ConnectedBody = () => (
        <Provider store={store}>
            {body}
        </Provider>
    )

    return {
        body: renderToString(<ConnectedBody/>),
    }
}
