import React from "react"
import { JssProvider, SheetsRegistry, ThemeProvider } from "react-jss"

const sheets = new SheetsRegistry()

// eslint-disable-next-line react/prop-types
exports.wrapRootComponent = ({ component }, { theme = {} }) => {
  // const theme = options.theme || {}
  return (
    <JssProvider registry={sheets}>
      <ThemeProvider theme={theme}>{component}</ThemeProvider>
    </JssProvider>
  )
}

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
