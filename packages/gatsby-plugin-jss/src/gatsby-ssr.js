import React from "react"
import { JssProvider, SheetsRegistry, ThemeProvider } from "react-jss"

/**
 * Keep track of SheetRegistry for each page
 */
const sheetsRegistryManager = new Map()

// eslint-disable-next-line react/prop-types,react/display-name
exports.wrapRootElement = ({ element, pathname }, { theme = {} }) => {
  const sheets = new SheetsRegistry()
  sheetsRegistryManager.set(pathname, sheets)

  return (
    <JssProvider registry={sheets}>
      <ThemeProvider theme={theme}>{element}</ThemeProvider>
    </JssProvider>
  )
}

exports.onRenderBody = ({ setHeadComponents, pathname }) => {
  const sheets = sheetsRegistryManager.get(pathname)
  if (sheets) {
    setHeadComponents([
      <style
        type="text/css"
        id="server-side-jss"
        key="server-side-jss"
        dangerouslySetInnerHTML={{ __html: sheets.toString() }}
      />,
    ])
    sheetsRegistryManager.delete(pathname)
  }
}
