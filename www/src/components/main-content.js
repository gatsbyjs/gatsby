import React from "react"

const MainContent = ({ children, ...props })  => {
    return (
        <main id="reach-skip-nav" {...props}>
        {children}
        </main>
      )
  }

export default MainContent;

  