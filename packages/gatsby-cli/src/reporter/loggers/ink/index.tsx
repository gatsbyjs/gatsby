import React, { useContext } from "react"
import { render } from "ink"
import StoreStateContext, { StoreStateProvider } from "./context"
import CLI from "./cli"

const ConnectedCLI: React.FC = (): React.ReactElement => {
  const state = useContext(StoreStateContext)
  const showStatusBar =
    state.program?._?.[0] === `develop` &&
    state.program?.status === `BOOTSTRAP_FINISHED`
  const showPageTree =
    state.program?._?.[0] === `build` &&
    state.logs.messages.find(message => message?.text?.includes(`onPostBuild`))

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
