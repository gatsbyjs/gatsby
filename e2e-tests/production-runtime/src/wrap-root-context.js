import React, { createContext, useContext } from "react"

export const WrapRootContext = createContext({})

export function WrapRootTesterComponent() {
  const { title } = useContext(WrapRootContext)

  return (
    <div>
      StaticQuery in wrapRootElement test (should show site title):
      <span data-testid="wrap-root-element-result">{title}</span>
    </div>
  )
}
