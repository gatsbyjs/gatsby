import * as React from "react"

import { getStore, onLogAction } from "../../redux/index"

const StoreStateContext = React.createContext(getStore().getState())

interface Props {
  children: React.ReactChild
}

export function StoreStateProvider ({ children }: Props): JSX.Element {
  const [state, setState] = React.useState(getStore().getState())

  React.useEffect(function effect() {
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
