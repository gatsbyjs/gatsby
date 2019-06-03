import React from "react"
import { ColorModeProvider, ThemeProvider } from "theme-ui"
import components from "./components"
import theme from "./index"

export default props => (
  <ColorModeProvider initialColorMode="light">
    <ThemeProvider {...props} components={components} theme={theme} />
  </ColorModeProvider>
)
