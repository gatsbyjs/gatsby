/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { useState, useRef, useLayoutEffect } from "react"
import MdCheckbox from "react-icons/lib/md/check-box"
import MdCheckboxBlank from "react-icons/lib/md/check-box-outline-blank"
import PropTypes from "prop-types"
import Highlight, { defaultProps } from "prism-react-renderer"

import Copy from "../copy"
import normalize from "./normalize"

const Collapsible = ({ children, isCollapsed, ...rest }) => {
  const ref = useRef(null)
  const [height, setHeight] = useState(null)
  const [overflow, setOverflow] = useState(null)
  const returnDefault = () => {
    setHeight(`auto`)
    setOverflow(`unset`)
  }
  useLayoutEffect(() => {
    let innerRefId
    const outerRefId = requestAnimationFrame(function() {
      const currentHeight = ref.current.scrollHeight
      if (isCollapsed) {
        setOverflow(`hidden`)
      }
      setHeight(currentHeight)
      innerRefId = requestAnimationFrame(function() {
        if (isCollapsed) {
          setHeight(0)
        }
      })
    })
    return () => {
      cancelAnimationFrame(outerRefId)
      cancelAnimationFrame(innerRefId)
    }
  }, [isCollapsed])
  return (
    <div
      {...rest}
      aria-hidden={isCollapsed}
      ref={ref}
      sx={{
        height: height === null ? `auto` : height,
        transition: `height 1s ease`,
        overflow: overflow,
      }}
      onAnimationEnd={() => !isCollapsed && returnDefault()}
    >
      {children}
    </div>
  )
}

const Line = ({ isCollapsible, isCollapsed, children, ...rest }) =>
  isCollapsible ? (
    <Collapsible isCollapsed={isCollapsed} {...rest}>
      {children}
    </Collapsible>
  ) : (
    <div {...rest}>{children}</div>
  )

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

/*
 * MDX passes the code block as JSX
 * we un-wind it a bit to get the string content
 * but keep it extensible so it can be used with just children (string) and className
 */
const CodeBlock = ({
  children,
  className = children.props ? children.props.className : ``,
  copy,
}) => {
  const [language, { title = `` }] = getParams(className)
  const [content, highlights, added] = normalize(
    children.props && children.props.children
      ? children.props.children
      : children,
    className
  )
  const hasAdded = Object.values(added).length > 0
  const [showAdded, setShowAdded] = useState(true)
  const mdCheckStyle = {
    height: `1.5rem`,
    width: `1.5rem`,
    position: `absolute`,
    right: `0`,
    color: `#567000`,
  }
  return (
    <Highlight
      {...defaultProps}
      code={content}
      language={language}
      theme={undefined}
    >
      {({ tokens, getLineProps, getTokenProps }) => (
        <React.Fragment>
          {title && (
            <div
              className="gatsby-code-title"
              sx={{ display: `flex`, justifyContent: `space-between` }}
            >
              <div sx={{ fontSize: 0 }}>{title}</div>
              {hasAdded ? (
                <div
                  sx={{ position: `relative` }}
                  onClick={() => setShowAdded(!showAdded)}
                >
                  <label sx={{ display: `flex`, alignItems: `center` }}>
                    <span>Additions</span>
                    {showAdded ? (
                      <MdCheckbox sx={mdCheckStyle} />
                    ) : (
                      <MdCheckboxBlank sx={mdCheckStyle} />
                    )}
                    <input
                      sx={{
                        marginLeft: `0.5rem`,
                        opacity: `0`,
                        height: `1.5rem`,
                        width: `1.5rem`,
                      }}
                      checked={showAdded}
                      type="checkbox"
                    />
                  </label>
                </div>
              ) : null}
            </div>
          )}
          <div className="gatsby-highlight">
            <pre className={`language-${language}`}>
              {copy && (
                <Copy
                  fileName={title}
                  sx={{
                    position: `absolute`,
                    right: t => t.space[1],
                    top: t => t.space[1],
                    borderRadius: 2,
                  }}
                  content={content}
                />
              )}
              <code className={`language-${language}`}>
                {tokens.map((line, i) => {
                  const lineProps = getLineProps({ line, key: i })
                  const className = [lineProps.className]
                    .concat(highlights[i] && `gatsby-highlight-code-line`)
                    .concat(added[i] && `gatsby-added-code-line`)
                    .filter(Boolean)
                    .join(` `)
                  return (
                    <Line
                      isCollapsible={added[i]}
                      isCollapsed={!showAdded}
                      key={i}
                      {...Object.assign({}, lineProps, {
                        className,
                      })}
                    >
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token, key })} />
                      ))}
                    </Line>
                  )
                })}
              </code>
            </pre>
          </div>
        </React.Fragment>
      )}
    </Highlight>
  )
}

CodeBlock.propTypes = {
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  className: PropTypes.string,
  copy: PropTypes.bool,
}

CodeBlock.defaultProps = {
  copy: true,
}

export default CodeBlock
