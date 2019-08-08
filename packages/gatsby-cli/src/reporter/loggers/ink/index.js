import React, { useState, useEffect } from "react"
import { render } from "ink"
import { Provider, connect } from "react-redux"

import { getStore, onStoreSwap } from "../../redux/index"

import CLI from "./cli"

const ConnectedCLI = connect(state => {
  const showStatusBar =
    state.program &&
    state.program._ &&
    state.program._[0] === `develop` &&
    state.program.status === `BOOTSTRAP_FINISHED`
  return {
    logs: state.logs,
    // pageCount: state.pages ? state.pages.size : 0,
    showStatusBar,
    // command: state.program ? state.program._ : ``,
    // bootstrapFinished: state.program ? state.program.status : ``,
  }
})(CLI)

const ReduxStoreProvider = ({ children }) => {
  const [store, setStore] = useState(getStore())
  useEffect(() => {
    onStoreSwap(newStore => {
      setStore(newStore)
    })
  }, [])

  return <Provider store={store}>{children}</Provider>
}

render(
  <ReduxStoreProvider>
    <ConnectedCLI />
  </ReduxStoreProvider>
)
