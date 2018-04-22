import { createElement as h } from "react"
import { Provider } from "styletron-react"
import { renderToString } from "react-dom/server"
import styletron from "./index.js"

exports.replaceRenderer = (
  { bodyComponent, setHeadComponents, replaceBodyHTMLString },
  options
) => {
  const instance = styletron(options).instance

  const app = h(Provider, { value: instance }, bodyComponent)

  replaceBodyHTMLString(renderToString(app))

  const stylesheets = instance.getStylesheets()
  const headComponents = stylesheets[0].css
    ? stylesheets.map((sheet, index) =>
        h(`style`, {
          className: `_styletron_hydrate_`,
          dangerouslySetInnerHTML: {
            __html: sheet.css,
          },
          key: index,
          media: sheet.attrs.media,
        })
      )
    : null

  setHeadComponents(headComponents)
}
