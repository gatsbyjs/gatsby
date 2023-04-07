import * as React from "react"
import { Server as Styletron } from "styletron-engine-atomic"
import { Provider } from "styletron-react"

let instance

export function wrapRootElement({ element }, options) {
  instance = new Styletron({ prefix: options.prefix })

  return <Provider value={instance}>{element}</Provider>
}

export function onRenderBody({ setHeadComponents }) {
  if (!instance) {
    return
  }

  const stylesheets = instance.getStylesheets()

  if (stylesheets.length) {
    const headComponents = stylesheets.map((sheet, index) => (
      <style
        className="_styletron_hydrate_"
        dangerouslySetInnerHTML={{
          __html: sheet.css,
        }}
        key={`styletron-${index}`}
        media={sheet.attrs.media}
        data-hydrate={sheet.attrs[`data-hydrate`]}
      />
    ))

    setHeadComponents(headComponents)
  }
}
