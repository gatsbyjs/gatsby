const rangeParser = require(`parse-numeric-range`)

/**
 * As code has already been prism-highlighted at this point,
 * a JSX opening comment:
 *     {/*
 * would look like this:
 *     <span class="token punctuation">{</span><span class="token comment">/*
 * And a HTML opening comment:
 *     <!--
 * would look like this:
 *     &lt;!--
 */
const HIGHLIGHTED_JSX_COMMENT_START = `<span class="token punctuation">\\{<\\/span><span class="token comment">\\/\\*`
const HIGHLIGHTED_JSX_COMMENT_END = `\\*\\/<\\/span><span class="token punctuation">\\}</span>`
const HIGHLIGHTED_HTML_COMMENT_START = `&lt;!--`

const PRISMJS_COMMENT_OPENING_SPAN_TAG = `(<span\\sclass="token\\scomment">)?`
const PRISMJS_COMMENT_CLOSING_SPAN_TAG = `(<\\/span>)?`

const COMMENT_START = new RegExp(
  `(#|\\/\\/|\\{\\/\\*|\\/\\*+|${HIGHLIGHTED_HTML_COMMENT_START})`
)

const COMMENT_END = new RegExp(`(-->|\\*\\/\\}|\\*\\/)?`)
const DIRECTIVE = /highlight-(next-line|line|start|end|range)({([^}]+)})?/
const END_DIRECTIVE = /highlight-end/

const PLAIN_TEXT_WITH_LF_TEST = /<span class="token plain-text">[^<]*\n[^<]*<\/span>/g

const stripComment = line =>
  /**
   * This regexp does the following:
   * 1. Match a comment start, along with the accompanying PrismJS opening comment span tag;
   * 2. Match one of the directives;
   * 3. Match a comment end, along with the accompanying PrismJS closing span tag.
   */
  line.replace(
    new RegExp(
      `\\s*(${HIGHLIGHTED_JSX_COMMENT_START}|${PRISMJS_COMMENT_OPENING_SPAN_TAG}${
        COMMENT_START.source
      })\\s*${DIRECTIVE.source}\\s*(${HIGHLIGHTED_JSX_COMMENT_END}|${
        COMMENT_END.source
      }${PRISMJS_COMMENT_CLOSING_SPAN_TAG})`
    ),
    ``
  )

const wrap = line =>
  [`<span class="gatsby-highlight-code-line">`, `${line}\n`, `</span>`].join(``)

const wrapAndStripComment = line => wrap(stripComment(line))

const getHighlights = (line, code, index) => {
  const [, directive, directiveRange] = line.match(DIRECTIVE)
  switch (directive) {
    case `next-line`:
      return [
        {
          code: wrap(code[index + 1]),
          highlighted: true,
        },
        index + 1,
      ]
    case `start`: {
      // find the next `highlight-end` directive, starting from next line
      const endIndex = code.findIndex(
        (line, idx) => idx > index && END_DIRECTIVE.test(line)
      )
      const end = endIndex === -1 ? code.length : endIndex
      const highlighted = code.slice(index + 1, end).map(line => {
        return {
          code: wrap(line),
          highlighted: true,
        }
      })
      return [highlighted, end]
    }
    case `line`:
      return [
        {
          code: wrapAndStripComment(line),
          highlighted: true,
        },
        index,
      ]
    case `range`:
      // if range is not provided we ignore the directive
      if (!directiveRange) {
        console.warn(`Invalid match specified: "${line.trim()}"`)
        return [
          {
            code: code[index + 1],
            highlighted: false,
          },
          index + 1,
        ]
      } else {
        const strippedDirectiveRange = directiveRange.slice(1, -1)
        const range = rangeParser.parse(strippedDirectiveRange)
        if (range.length > 0) {
          // if current line is 10 and range is {1-5, 7}, lastLineIndexInRange === 17
          let lastLineIndexInRange = index + 1 + range[range.length - 1]
          // if range goes farther than code length, make lastLineIndexInRange equal to code length
          if (lastLineIndexInRange > code.length) {
            lastLineIndexInRange = code.length
          }
          const highlighted = code
            .slice(index + 1, lastLineIndexInRange)
            .map((line, idx) => {
              return {
                code: range.includes(idx + 1) ? wrap(line) : line,
                highlighted: range.includes(idx + 1),
              }
            })
          return [highlighted, lastLineIndexInRange - 1]
        }
        // if range is incorrect we ignore the directive
        console.warn(`Invalid match specified: "${line.trim()}"`)
        return [
          {
            code: code[index + 1],
            highlighted: false,
          },
          index + 1,
        ]
      }
    default:
      return [
        {
          code: wrap(line),
          highlighted: true,
        },
        index,
      ]
  }
}

module.exports = function highlightLineRange(code, highlights = []) {
  if (highlights.length > 0 || DIRECTIVE.test(code)) {
    // HACK split plain-text spans with line separators inside into multiple plain-text spans
    // separatered by line separator - this fixes line highlighting behaviour for jsx
    code = code.replace(PLAIN_TEXT_WITH_LF_TEST, match =>
      match.replace(/\n/g, `</span>\n<span class="token plain-text">`)
    )
  }

  let highlighted = []
  const split = code.split(`\n`)

  // If a highlight range is passed with the language declaration, e.g.
  //     ```jsx{1, 3-4}
  // we only use that and do not try to parse highlight directives
  if (highlights.length > 0) {
    return split.map((line, i) => {
      if (highlights.includes(i + 1)) {
        return {
          highlighted: true,
          code: wrap(line),
        }
      }
      return {
        code: line,
      }
    })
  }
  for (let i = 0; i < split.length; i++) {
    const line = split[i]
    if (DIRECTIVE.test(line)) {
      const [highlights, index] = getHighlights(line, split, i)
      highlighted = highlighted.concat(highlights)
      i = index
    } else {
      highlighted.push({
        code: line,
      })
    }
  }
  return highlighted
}
