import React from "react"
import ThemeProvider from "./src/theme/provider"

export const wrapRootElement = ({ element }) => (
  <ThemeProvider>{element}</ThemeProvider>
)
