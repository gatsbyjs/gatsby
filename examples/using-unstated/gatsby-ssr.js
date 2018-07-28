import React from 'react'
import { Provider } from 'unstated'
import { renderToString } from 'react-dom/server'

export const replaceRenderer = ({ bodyComponent, replaceBodyHTMLString }) => {

    const ConnectedBody = () => (
        <Provider>
            {bodyComponent}
        </Provider>
    )
    replaceBodyHTMLString(renderToString(<ConnectedBody/>))
}
