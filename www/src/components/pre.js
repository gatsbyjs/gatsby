import React from "react"
import Highlight, { defaultProps } from "prism-react-renderer"

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

export default ({ children }) => {
  const [language, { title = `` }] = getParams(children.props.className)
  const content = children.props.children
  return (
    <Highlight
      {...defaultProps}
      code={content}
      language={language}
      theme={undefined}
    >
      {({ tokens, getLineProps, getTokenProps }) => (
        <div className="gatsby-highlight">
          <div className="gatsby-highlight-header">
            {title && (
              <div className="gatsby-code-title" css={{ paddingTop: space[4] }}>
                {title}
              </div>
            )}
            <Copy content={content} />
          </div>
          <pre className={`language-${language}`}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        </div>
      )}
    </Highlight>
  )
}
