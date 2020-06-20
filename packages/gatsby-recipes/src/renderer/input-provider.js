import React, { useContext, useState } from "react"

const InputContext = React.createContext({})

export const useInputByUuid = key => {
  const context = useContext(InputContext) || {}
  console.log(`useInputByUuid`, { context, key })
  const result = context[key]
  console.log({ result })
  return result?.value
}

export const InputProvider = InputContext.Provider
