import React from "react"
import { ThemeProvider } from "theme-ui"
import theme from "./theme"

const Root = props => (
  <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
)

export const wrapRootElement = ({ element, props }) => (
  <Root {...props}>{element}</Root>
)
