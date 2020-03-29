import React, { useState, useEffect, createContext } from "react"

import ReporterStore from "../../redux/index"

const { getStore, onLogAction } = ReporterStore

const StoreStateContext = createContext(getStore().getState())

export const StoreStateProvider = ({ children }) => {
  const [state, setState] = useState(getStore().getState())

  useEffect(() => {
    const unsubscribe = onLogAction(() => {
      setState(getStore().getState())
    })
    return unsubscribe
  }, [])

  return (
    <StoreStateContext.Provider value={state}>
      {children}
    </StoreStateContext.Provider>
  )
}

export default StoreStateContext
