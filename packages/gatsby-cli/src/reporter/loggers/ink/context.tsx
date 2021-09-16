import React, { useState, useLayoutEffect, createContext } from "react"
import { getStore, onLogAction } from "../../redux"
import { IGatsbyCLIState } from "../../redux/types"
import { IRenderPageArgs } from "../../types"

const StoreStateContext = createContext<{
  logs: IGatsbyCLIState
  pageTree: IRenderPageArgs | null
}>(getStore().getState())

export const StoreStateProvider: React.FC = ({
  children,
}): React.ReactElement => {
  const [state, setState] = useState(getStore().getState())

  useLayoutEffect(
    () =>
      onLogAction(() => {
        setState(getStore().getState())
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
