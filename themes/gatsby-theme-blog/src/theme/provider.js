import React from "react"
import "typeface-montserrat"
import "typeface-merriweather"
import { ColorModeProvider, ThemeProvider } from "theme-ui"
import theme from "./index"

export default props => (
  <ColorModeProvider initialColorMode="light">
    <ThemeProvider {...props} theme={theme} />
  </ColorModeProvider>
)
