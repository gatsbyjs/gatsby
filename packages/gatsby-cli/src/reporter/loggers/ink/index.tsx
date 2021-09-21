import React, { useContext } from "react"
import { render } from "ink"
import StoreStateContext, { StoreStateProvider } from "./context"
import CLI from "./cli"

const ConnectedCLI: React.FC = (): React.ReactElement => {
  const state = useContext(StoreStateContext)
  const showStatusBar =
    // @ts-ignore - program exists on state but we should refactor this
    state.program?._?.[0] === `develop` &&
    // @ts-ignore - program exists on state but we should refactor this
    state.program?.status === `BOOTSTRAP_FINISHED`
  const showPageTree = !!state.pageTree

  return (
    <CLI
      showStatusBar={Boolean(showStatusBar)}
      showPageTree={Boolean(showPageTree)}
      logs={state.logs}
    />
  )
}

export function initializeINKLogger(): void {
  render(
    <StoreStateProvider>
      <ConnectedCLI />
    </StoreStateProvider>
  )
}
