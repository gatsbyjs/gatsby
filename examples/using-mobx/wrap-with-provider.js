import React from "react"
import { Provider } from "mobx-react"
import CounterStore from "./src/models/CounterModel"

// eslint-disable-next-line react/display-name,react/prop-types
export default ({ element }) => (
  <Provider store={CounterStore}>{element}</Provider>
)
