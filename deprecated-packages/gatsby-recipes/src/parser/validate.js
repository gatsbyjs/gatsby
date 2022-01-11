import { transform } from "@babel/standalone"
import babelPluginTransformReactJsx from "@babel/plugin-transform-react-jsx"
import visit from "unist-util-visit"

import { u } from "."

const validateJsx = () => tree => {
  visit(tree, `jsx`, node => {
    try {
      transform(`<>${node.value}<>`, {
        plugins: [babelPluginTransformReactJsx],
      })
    } catch (e) {
      e.syntaxError = {
        errorType: `parse`,
        errorDescription: `Unable to parse JSX`,
        line: node.position.start.line + e.loc.line - 1,
        trace: e.toString(),
      }

      throw e
    }

    return undefined
  })
}

export default function validate(mdx) {
  try {
    u.use(validateJsx).processSync(mdx)
  } catch (e) {
    return e.syntaxError
  }

  return undefined
}
