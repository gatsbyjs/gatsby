/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import PropTypes from "prop-types"
import loadable from "@loadable/component"

const Copy = props => <pre>TODO: Copy</pre>

const LazyHighlight = loadable(async () => {
  const Module = await import(`prism-react-renderer`)
  const Highlight = Module.default
  const defaultProps = Module.defaultProps
  return props => <Highlight {...defaultProps} {...props} />
})

export default function CodeBlock ({
  children,
  language: WPLanguage,
  title: WPTitle,
  className = children.props ? children.props.className : ``,
}) {
  let language
  let title = ``

  if (!WPLanguage) {
    language = getParams(className)[0]
    title = getParams(className)[1].title
  } else {
    language = WPLanguage
    title = WPTitle
  }

  const [content, highlights] = normalize(
    children.props && children.props.children
      ? children.props.children
      : children,
    className
  )

  return (
    <LazyHighlight code={content} language={language} theme={undefined}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <React.Fragment>
          {title && (
            <div className="gatsby-code-title">
              <div sx={{ fontSize: 0 }}>{title}</div>
            </div>
          )}
          <div className="gatsby-highlight">
            <pre className={`language-${language}`}>
              <Copy
                fileName={title}
                sx={{
                  position: `absolute`,
                  right: 2,
                  top: 2,
                  borderRadius: 2,
                }}
                content={content}
              />
              <code className={`language-${language}`}>
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
              </code>
            </pre>
          </div>
        </React.Fragment>
      )}
    </LazyHighlight>
  )
}

CodeBlock.propTypes = {
  language: PropTypes.string,
  // built-in props don't need prop types
  // children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  // title: PropTypes.string,
  // className: PropTypes.string,
  // copy: PropTypes.bool,
}

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

const COMMENT_START = new RegExp(`(#|\\/\\/|\\{\\/\\*|\\/\\*+|<!--)`)

const createDirectiveRegExp = featureSelector =>
  new RegExp(`${featureSelector}-(next-line|line|start|end|range)({([^}]+)})?`)

const COMMENT_END = new RegExp(`(-->|\\*\\/\\}|\\*\\/)?`)
const DIRECTIVE = createDirectiveRegExp(`(highlight|hide)`)
const HIGHLIGHT_DIRECTIVE = createDirectiveRegExp(`highlight`)
const HIDE_DIRECTIVE = createDirectiveRegExp(`hide`)

const END_DIRECTIVE = {
  highlight: /highlight-end/,
  hide: /hide-end/,
}

const stripComment = line =>
  /**
   * This regexp does the following:
   * 1. Match a comment start, along with the accompanying PrismJS opening comment span tag;
   * 2. Match one of the directives;
   * 3. Match a comment end, along with the accompanying PrismJS closing span tag.
   */
  line.replace(
    new RegExp(
      `\\s*(${COMMENT_START.source})\\s*${DIRECTIVE.source}\\s*(${COMMENT_END.source})`
    ),
    ``
  )

const containsDirective = line =>
  [HIDE_DIRECTIVE, HIGHLIGHT_DIRECTIVE].some(expr => expr.test(line))

/*
 * This parses the {1-3} syntax range that is sometimes used
 */
const getInitialFilter = (className, split) => {
  const lineNumberExpr = /{([^}]+)/
  const [, match] = className.match(lineNumberExpr) || []
  if (match) {
    const lookup = match.split(/,\s*/).reduce((merged, range) => {
      const [start, end = start] = range
        .split(`-`)
        .map(num => parseInt(num, 10))
      for (let i = start; i <= end; i++) {
        merged[i - 1] = true
      }
      return merged
    }, {})
    return split.map((line, index) => {
      return {
        code: line,
        highlighted: !!lookup[index],
      }
    })
  }
  return []
}

/*
 * This function will output the normalized content (stripped of comment directives)
 * alongside a lookup of filtered lines
 * https://github.com/gatsbyjs/gatsby/blob/dad0628f274f1c61853f3177573bb17a79e4a540/packages/gatsby-remark-prismjs/src/directives.js
 */
const normalize = (content, className = ``) => {
  const split = content.split(`\n`)
  let filtered = getInitialFilter(className, split)

  if (filtered.length === 0) {
    for (let i = 0; i < split.length; i++) {
      const line = split[i]
      if (containsDirective(line) && className !== `language-no-highlight`) {
        const [, keyword, directive] = line.match(DIRECTIVE)
        switch (directive) {
          case `start`: {
            const endIndex = split
              .slice(i + 1)
              .findIndex(line => END_DIRECTIVE[keyword].test(line))

            const end = endIndex === -1 ? split.length : endIndex + i

            if (keyword === `highlight`) {
              filtered = filtered.concat(
                split.slice(i, end + 1).reduce((merged, line) => {
                  const code = stripComment(line)
                  if (code) {
                    merged.push({
                      code,
                      highlighted: true,
                    })
                  }
                  return merged
                }, [])
              )
            }

            i = end
            break
          }
          case `line`: {
            const code = stripComment(line)
            if (keyword === `highlight` && code) {
              filtered.push({
                code,
                highlighted: true,
              })
            }
            break
          }
          case `next-line`: {
            const code = stripComment(line)
            if (keyword === `highlight`) {
              filtered = filtered.concat(
                [
                  {
                    code,
                  },
                  {
                    code: stripComment(split[i + 1]),
                    highlighted: true,
                  },
                ].filter(line => line.code)
              )
            } else if (keyword === `hide` && code) {
              filtered.push({
                code,
              })
            }
            i += 1
            break
          }
          default: {
            break
          }
        }
      } else {
        filtered.push({
          code: line,
        })
      }
    }
  }

  return [
    filtered
      .map(({ code }) => code)
      .join(`\n`)
      .trim(),
    filtered.reduce((lookup, { highlighted }, index) => {
      if (highlighted) {
        lookup[index] = true
      }
      return lookup
    }, {}),
  ]
}

