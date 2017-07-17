import { renderToString } from "react-dom/server"
import inline from "glamor-inline"

exports.replaceRenderer = ({ bodyComponent, replaceBodyHTMLString }) => {
  const bodyHTML = renderToString(bodyComponent)
  const inlinedHTML = inline(bodyHTML)

  replaceBodyHTMLString(inlinedHTML)
}
