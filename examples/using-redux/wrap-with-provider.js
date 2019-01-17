import React from "react"
import { Provider } from "react-redux"

import createStore from "./src/state/createStore"

// eslint-disable-next-line react/display-name,react/prop-types
export default ({ element }) => {
  // Create a fresh store for each SSR page:
  const store = createStore()
  return (<Provider store={store}>{element}</Provider>)
}
