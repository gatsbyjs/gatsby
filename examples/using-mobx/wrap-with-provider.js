import React from "react"
import { MobXProviderContext } from "mobx-react"
import CounterStore from "./src/models/CounterModel"

const App =({ element }) => (
  <MobXProviderContext.Provider value={CounterStore}>{element}</MobXProviderContext.Provider>
)

export default App;
