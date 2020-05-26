import React, { useContext } from "react"

const ResourceContext = React.createContext({})

export const useResourceContext = resourceName => {
  const context = useContext(ResourceContext)
  return context[resourceName]
}

export const ResourceProvider = ({ data: providedData, children }) => {
  const parentData = useResourceContext()
  const data = { ...parentData, ...providedData }

  return (
    <ResourceContext.Provider value={data}>{children}</ResourceContext.Provider>
  )
}
