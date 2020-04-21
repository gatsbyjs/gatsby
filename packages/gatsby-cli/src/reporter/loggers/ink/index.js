import React, { useContext } from "react"
import { render } from "ink"
import StoreStateContext, { StoreStateProvider } from "./context"

import CLI from "./cli"

const ConnectedCLI = () => {
  const state = useContext(StoreStateContext)
  const showStatusBar =
    state.program &&
    state.program._ &&
    state.program._[0] === `develop` &&
    state.program.status === `BOOTSTRAP_FINISHED`

  return <CLI showStatusBar={Boolean(showStatusBar)} logs={state.logs} />
}

render(
  <StoreStateProvider>
    <ConnectedCLI />
  </StoreStateProvider>
)
