// this file has the best name
import React, { useContext } from "react"

const ProviderContext = React.createContext([])

export const useProvider = provider => {
  // const context = useContext(ResourceContext)
  // const result = context.find(c => c.resourceDefinitions._key === key)
  // return result
  const providers = {
    contentful: {
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    },
  }

  return providers[provider]
}

// export const ResourceProvider = ResourceContext.Provider
