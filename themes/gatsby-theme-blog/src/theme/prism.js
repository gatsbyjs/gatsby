export default {
  ".attr-name": {
    fontStyle: `italic`,
  },
  ".comment": {
    color: `prism.comment`,
  },
  ".attr-name, .string, .url": {
    color: `prism.string`,
  },
  ".variable": {
    color: `prism.var`,
  },
  ".number": {
    color: `prism.number`,
  },
  ".builtin, .char, .constant, .function": {
    color: `prism.constant`,
  },
  ".punctuation, .selector, .doctype": {
    color: `prism.punctuation`,
  },
  ".class-name": {
    color: `prism.className`,
  },
  ".tag, .operator, .keyword": {
    color: `prism.tag`,
  },
  ".boolean": {
    color: `prism.boolean`,
  },
  ".property": {
    color: `prism.property`,
  },
  ".namespace": {
    color: `prism.namespace`,
  },
  ".gatsby-highlight-code-line": {
    bg: `prism.highlight`,
    display: `block`,
    mx: -3,
    // compensate for 4px border
    pl: t => t.space[3] - 4,
    pr: 3,
    borderLeft: `4px solid`,
    borderColor: `prism.tag`,
  },
}
