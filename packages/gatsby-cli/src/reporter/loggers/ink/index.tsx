import * as React from "react"
import { render } from "ink"
import StoreStateContext, { StoreStateProvider } from "./context"

import Cli from "./cli"

function ConnectedCLI(): JSX.Element {
  const state = React.useContext(StoreStateContext)

  const showStatusBar =
    state.program &&
    state.program._ &&
    state.program._[0] === `develop` &&
    state.program.status === `BOOTSTRAP_FINISHED`

  return <Cli showStatusBar={showStatusBar} logs={state.logs} />
}

render(
  <StoreStateProvider>
    <ConnectedCLI />
  </StoreStateProvider>
)
