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
export default (content, className = ``) => {
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
