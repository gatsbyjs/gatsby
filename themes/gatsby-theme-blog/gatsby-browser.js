import React from "react"
import { ThemeProvider } from "emotion-theming"
import tokens from "./src/components/tokens"

export const wrapRootElement = ({ element }) => (
  <ThemeProvider theme={tokens}>{element}</ThemeProvider>
)
