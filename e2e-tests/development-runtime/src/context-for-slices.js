import React from "react"

const ContextForSlices = React.createContext()

const ContextForSlicesProvider = ({ children }) => {
  const contextValue = {
    posts: [
      {
        title: "My first blog post",
        content: "This is my first blog post",
      },
      {
        title: "My second blog post",
        content: "This is my second blog post",
      },
    ],
  }
  return (
    <ContextForSlices.Provider value={contextValue}>
      {children}
    </ContextForSlices.Provider>
  )
}

export { ContextForSlices, ContextForSlicesProvider }
