import React, { useContext, useState } from "react"

const InputContext = React.createContext({})

export const useInputByKey = key => {
  const context = useContext(InputContext) || {}
  const result = context[key]
  return result?.value
}

export const InputProvider = InputContext.Provider
