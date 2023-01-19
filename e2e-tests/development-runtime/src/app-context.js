import React from "react"

const AppContext = React.createContext()
const contextValue = {
  posts: [
    {
      title: `My first blog post`,
      content: `This is my first blog post`,
    },
    {
      title: `My second blog post`,
      content: `This is my second blog post`,
    },
  ],
}

const AppContextProvider = ({ children }) => {
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

export { AppContext, AppContextProvider, contextValue }
