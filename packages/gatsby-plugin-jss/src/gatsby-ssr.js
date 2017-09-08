import React from "react"
import { renderToString } from "react-dom/server"
import { JssProvider, SheetsRegistry } from "react-jss"

exports.replaceRenderer = ({
  bodyComponent,
  replaceBodyHTMLString,
  setHeadComponents,
}) => {
  const sheets = new SheetsRegistry()

  const bodyHTML = renderToString(
    <JssProvider registry={sheets}>{bodyComponent}</JssProvider>
  )

  replaceBodyHTMLString(bodyHTML)
  setHeadComponents([
    <style
      type="text/css"
      id="server-side-jss"
      key="server-side-jss"
      dangerouslySetInnerHTML={{ __html: sheets.toString() }}
    />,
  ])
}
