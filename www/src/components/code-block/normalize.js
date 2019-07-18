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
      `\\s*(${COMMENT_START.source})\\s*${DIRECTIVE.source}\\s*(${
        COMMENT_END.source
      })`
    ),
    ``
  )

const containsDirective = line =>
  [HIDE_DIRECTIVE, HIGHLIGHT_DIRECTIVE].some(expr => expr.test(line))

/*
 * This parses the {1-3} syntax range that is sometimes used
 */
const getInitialHighlights = (className, split) => {
  const lineNumberExpr = /{([^}]+)/
  const [, match] = className.match(lineNumberExpr) || []
  if (match) {
    return match.split(/,\s*/).reduce((merged, range) => {
      const [start, end = start] = range
        .split(`-`)
        .map(num => parseInt(num, 10))
      for (let i = start; i <= end; i++) {
        merged[split[i - 1]] = true
      }
      return merged
    }, {})
  }
  return {}
}

/*
 * This function will output the normalized content (stripped of comment directives)
 * alongside a lookup of filtered lines
 */
export default (content, className) => {
  const split = content.split(`\n`)
  let filtered = []
  let highlights = getInitialHighlights(className, split)

  for (let i = 0; i < split.length; i++) {
    const line = split[i]
    if (containsDirective(line)) {
      const [, keyword, directive] = line.match(DIRECTIVE)
      switch (directive) {
        case `start`: {
          const endIndex = split
            .slice(i + 1)
            .findIndex(line => END_DIRECTIVE[keyword].test(line))

          const end = endIndex === -1 ? split.length : endIndex + i

          if (keyword === `highlight`) {
            const stripped = stripComment(line)
            if (stripped !== ``) {
              filtered.push(stripped)
            }
            for (let j = i; j <= end + 1; j++) {
              highlights[stripComment(split[j])] = true
            }
          } else if (keyword === `hide`) {
            i = end
          }
          break
        }
        case `end`: {
          const stripped = stripComment(line)
          if (stripped !== ``) {
            filtered.push(stripped)
          }
          break
        }
        case `line`: {
          if (keyword === `highlight`) {
            const stripped = stripComment(line)
            highlights[stripped] = true
            filtered.push(stripped)
          }
          break
        }
        case `next-line`: {
          if (keyword === `highlight`) {
            highlights[split[i + 1]] = true
          } else if (keyword === `hide`) {
            filtered.push(stripComment(line))
            i += 1
          }
          break
        }
        default: {
          break
        }
      }
    } else {
      filtered.push(line)
    }
  }

  return [
    filtered.join(`\n`),
    filtered.reduce((merged, line, index) => {
      if (highlights[line]) {
        merged[index] = true
      }
      return merged
    }, {}),
  ]
}
