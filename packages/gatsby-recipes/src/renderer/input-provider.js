import React, { useContext } from "react"

const InputContext = React.createContext({})

export const useInputByUuid = uuid => {
  const context = useContext(InputContext)
  return context[uuid]
}

export const InputProvider = InputContext.Provider
