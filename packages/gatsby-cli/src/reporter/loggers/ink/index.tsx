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
  const showTrees = !!state.pageTree

  return (
    <CLI
      showStatusBar={Boolean(showStatusBar)}
      showTrees={Boolean(showTrees)}
      logs={state.logs}
      messages={state.messages}
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
