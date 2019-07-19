import React from "react"
import Highlight, { defaultProps } from "prism-react-renderer"

import Copy from "../copy"
import normalize from "./normalize"
import { fontSizes, radii, space } from "../../utils/presets"

const getParams = (name = ``) => {
  const [lang, params = ``] = name.split(`:`)
  return [
    lang
      .split(`language-`)
      .pop()
      .split(`{`)
      .shift(),
  ].concat(
    params.split(`&`).reduce((merged, param) => {
      const [key, value] = param.split(`=`)
      merged[key] = value
      return merged
    }, {})
  )
}

export default ({ children }) => {
  const [language, { title = `` }] = getParams(children.props.className)
  const [content, highlights] = normalize(
    children.props.children,
    children.props.className
  )

  return (
    <Highlight
      {...defaultProps}
      code={content}
      language={language}
      theme={undefined}
    >
      {({ tokens, getLineProps, getTokenProps }) => (
        <div className="gatsby-highlight">
          {title && (
            <div className="gatsby-highlight-header">
              <div
                className="gatsby-code-title"
                css={{ fontSize: fontSizes[0] }}
              >
                {title}
              </div>
            </div>
          )}
          <pre className={`language-${language}`}>
            <Copy
              fileName={title}
              css={{
                position: `absolute`,
                right: space[1],
                top: space[1],
                borderRadius: `${radii[2]}px ${radii[2]}px`,
              }}
              content={content}
            />
            {tokens.map((line, i) => {
              const lineProps = getLineProps({ line, key: i })
              const className = [lineProps.className]
                .concat(highlights[i] && `gatsby-highlight-code-line`)
                .filter(Boolean)
                .join(` `)
              return (
                <div
                  key={i}
                  {...Object.assign({}, lineProps, {
                    className,
                  })}
                >
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </div>
              )
            })}
          </pre>
        </div>
      )}
    </Highlight>
  )
}
