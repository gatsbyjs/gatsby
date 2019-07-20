import React from "react"
import { ThemeProvider, ColorMode } from "theme-ui"
import theme from "./src/gatsby-plugin-theme-ui"
import GuideList from "./src/components/guide-list.js"
import HubspotForm from "./src/components/hubspot-form"
import Pullquote from "./src/components/shared/pullquote"
import DateChart from "./src/components/chart"
import CodeBlock from "./src/components/code-block"

const components = {
  GuideList,
  HubspotForm,
  DateChart,
  Pullquote,
  pre: CodeBlock,
}

export default ({ element }) => (
  <ThemeProvider theme={theme} components={components}>
    <ColorMode />
    {element}
  </ThemeProvider>
)
