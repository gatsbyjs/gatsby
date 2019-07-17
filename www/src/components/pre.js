import React from "react"

import Copy from "./copy"

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
      <span className="gatsby-highlight-header">
        {title && <div className="gatsby-code-title">{title}</div>}
        <Copy content={content} />
      </span>
      <pre className={`language-${language}`} data-language={language}>
        <code>{content}</code>
      </pre>
    </div>
  )
}
