import type { GatsbySSR } from "gatsby"

export const onRenderBody: GatsbySSR["onRenderBody"] = ({ setHtmlAttributes }) => {
  setHtmlAttributes({ lang: "en-US" })
}