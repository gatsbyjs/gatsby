import React from "react"
import { JssProvider, SheetsRegistry, ThemeProvider } from "react-jss"

const sheets = new SheetsRegistry()

// eslint-disable-next-line react/prop-types,react/display-name
exports.wrapRootElement = ({ element }, { theme = {} }) => (
  <JssProvider registry={sheets}>
    <ThemeProvider theme={theme}>{element}</ThemeProvider>
  </JssProvider>
)

exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <style
      type="text/css"
      id="server-side-jss"
      key="server-side-jss"
      dangerouslySetInnerHTML={{ __html: sheets.toString() }}
    />,
  ])
}
