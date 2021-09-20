import React, { useContext } from "react"

const ResourceContext = React.createContext([])

export const useResourceContext = () => {
  const context = useContext(ResourceContext)
  return context
}

export const useResource = key => {
  const context = useContext(ResourceContext)
  const result = context.find(c => c.resourceDefinitions._key === key)
  return result || {}
}

export const useResourceByUUID = uuid => {
  const context = useContext(ResourceContext)
  const result = context.find(c => c._uuid === uuid)
  return result
}

export const ResourceProvider = ResourceContext.Provider
