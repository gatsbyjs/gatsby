import React from "react"
import { enableStaticRendering, MobXProviderContext } from "mobx-react"
import CounterStore from "./src/models/CounterModel"

// https://mobx.js.org/react-integration.html#static-rendering
enableStaticRendering(true)

const App =({ element }) => (
  <MobXProviderContext.Provider value={CounterStore}>{element}</MobXProviderContext.Provider>
)

export default App;
