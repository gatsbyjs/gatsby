import React, { useContext } from "react"
import { render } from "ink"
import StoreStateContext, { StoreStateProvider } from "./context"
import CLI from "./cli"

const ConnectedCLI: React.FC = (): React.ReactElement => {
  const state = useContext(StoreStateContext)
  const showStatusBar =
    state.program?._?.[0] === `develop` &&
    state.program?.status === `BOOTSTRAP_FINISHED`

  return <CLI showStatusBar={Boolean(showStatusBar)} logs={state.logs} />
}

export function initializeINKLogger(): void {
  render(
    <StoreStateProvider>
      <ConnectedCLI />
    </StoreStateProvider>
  )
}
