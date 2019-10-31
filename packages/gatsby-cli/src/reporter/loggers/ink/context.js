import React, { useState, useEffect, createContext } from "react"

import { getStore, onLogAction } from "../../redux/index"

const StoreStateContext = createContext(getStore().getState())

export const StoreStateProvider = ({ children }) => {
  const [state, setState] = useState(getStore().getState())

  useEffect(() => {
    onLogAction(() => {
      setState(getStore().getState())
    })
  }, [])

  return (
    <StoreStateContext.Provider value={state}>
      {children}
    </StoreStateContext.Provider>
  )
}

export default StoreStateContext
