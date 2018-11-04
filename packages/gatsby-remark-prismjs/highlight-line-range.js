"use strict"

const rangeParser = require(`parse-numeric-range`)

const COMMENT_START = /(#|\/\/|\{\/\*|\/\*+|<!--)/
const COMMENT_END = /(-->|\*\/\}|\*\/)?/
const DIRECTIVE = /highlight-(next-line|line|start|end|range)({([^}]+)})?/
const END_DIRECTIVE = /highlight-end/
const plainTextWithLFTest = /<span class="token plain-text">[^<]*\n[^<]*<\/span>/g

const stripComment = line =>
  line.replace(
    new RegExp(
      `\\s*${COMMENT_START.source}\\s*${DIRECTIVE.source}\\s*${
        COMMENT_END.source
      }`
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
          let lastLineIndexInRange = index + 1 + range[range.length - 1] // if range goes farther than code length, make lastLineIndexInRange equal to code length

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
          return [highlighted, lastLineIndexInRange]
        } // if range is incorrect we ignore the directive

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
    code = code.replace(plainTextWithLFTest, match =>
      match.replace(/\n/g, `</span>\n<span class="token plain-text">`)
    )
  }

  let highlighted = []
  const split = code.split(`\n`)

  if (highlights.length > 0) {
    return split.map((line, i) => {
      if (highlights.includes(i + 1)) {
        return {
          highlighted: true,
          code: line,
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
