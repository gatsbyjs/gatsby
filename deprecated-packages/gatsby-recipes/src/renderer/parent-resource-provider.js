import React, { useContext } from "react"

const ParentResourceContext = React.createContext({})

export const useParentResourceContext = () => {
  const context = useContext(ParentResourceContext)
  return context
}

export const ParentResourceProvider = ({ data: providedData, children }) => {
  const parentData = useParentResourceContext()
  const data = { ...parentData, ...providedData }

  return (
    <ParentResourceContext.Provider value={data}>
      {children}
    </ParentResourceContext.Provider>
  )
}
