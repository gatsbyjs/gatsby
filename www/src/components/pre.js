import React from "react"

import Copy from "./copy"
import { fonts, space } from "../utils/presets"

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
      {title && (
        <div className="gatsby-highlight-header gatsby-code-title">
          {title}
        </div>
      )}
      <pre css={{ position: `relative` }} className={`language-${language}`} data-language={language}>
        <Copy content={content} />
        <code>{content}</code>
      </pre>
    </div>
  )
}
