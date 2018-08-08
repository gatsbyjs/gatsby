import React from "react"
import { Provider } from "react-redux"

import createStore from "./src/state/createStore"

const store = createStore()

export const wrapRootComponent = ({ Root }) => {
  const ConnectedRootComponent = () => (
    <Provider store={store}>
      <Root />
    </Provider>
  )

  return ConnectedRootComponent
}
