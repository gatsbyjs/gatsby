import React from "react"

import Copy from "./copy"
import { space } from "../utils/presets"

const getParams = (name = ``) => {
  const [lang, params = ``] = name.split(`:`)
  return [lang.split(`language-`).pop()].concat(
    params.split(`&`).reduce((merged, param) => {
      const [key, value] = param.split(`=`)
      merged[key] = value
      return merged
    }, {})
  )
}

export default props => {
  const [language, { title = `` }] = getParams(props.children.props.className)
  const content = props.children.props.children
  return (
    <div className="gatsby-highlight">
      <div className="gatsby-highlight-header">
        {title && (
          <div className="gatsby-code-title" css={{ paddingTop: space[4] }}>
            {title}
          </div>
        )}
        <Copy content={content} />
      </div>
      <pre className={`language-${language}`} data-language={language}>
        <code>{content}</code>
      </pre>
    </div>
  )
}
