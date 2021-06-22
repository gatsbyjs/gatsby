import React from "react"
import { Provider } from "react-redux"
import configureStore from "./store"

const ReduxWrapper = ({ element }) => (
  <Provider store={configureStore()}>{element}</Provider>
)

export default ReduxWrapper
