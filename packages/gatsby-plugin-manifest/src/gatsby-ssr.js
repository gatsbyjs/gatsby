import React from "react"
import { withPrefix } from "gatsby"
import { generateHeadComponents } from "./components.js"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  setHeadComponents(generateHeadComponents(withPrefix, pluginOptions))
}
