import React, { useState, useLayoutEffect, createContext } from "react"
import { getStore, onLogAction } from "../../redux"
import { IGatsbyState } from "gatsby/src/redux/types"

// These weird castings we are doing in this file is because the way gatsby-cli works is that it starts with it's own store
// but then quickly swaps it out with the store from the installed gatsby. This would benefit from a refactor later on
// to not use it's own store temporarily.
// By the time this is actually running, it will become an `IGatsbyState`
const StoreStateContext = createContext<IGatsbyState>(
  getStore().getState() as any as IGatsbyState
)

export const StoreStateProvider: React.FC = ({
  children,
}): React.ReactElement => {
  const [state, setState] = useState(
    getStore().getState() as any as IGatsbyState
  )

  useLayoutEffect(
    () =>
      onLogAction(() => {
        setState(getStore().getState() as any as IGatsbyState)
      }),
    []
  )

  return (
    <StoreStateContext.Provider value={state}>
      {children}
    </StoreStateContext.Provider>
  )
}

export default StoreStateContext
