import React from "react"
import loadable from "@loadable/component"

const LazyHighlight = loadable(async () => {
  const Module = await import(`prism-react-renderer`)
  const Highlight = Module.default
  const defaultProps = Module.defaultProps
  return props => <Highlight {...defaultProps} {...props} />
})

export default LazyHighlight
