import React, { useContext } from "react"

const ResourceContext = React.createContext([])

export const useResourceContext = () => {
  const context = useContext(ResourceContext)
  return context
}

export const useResourceByKey = key => {
  const context = useContext(ResourceContext)
  const result = context.find(c => c.resourceDefinitions._key === key)
  return result
}

export const ResourceProvider = ResourceContext.Provider
