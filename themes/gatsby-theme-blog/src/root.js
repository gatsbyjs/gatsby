import React from "react"
import ThemeProvider from "./theme/provider"

export const wrapRootElement = ({ element }) => (
  <ThemeProvider>{element}</ThemeProvider>
)
