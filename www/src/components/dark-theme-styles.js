import React from "react"
import { useColorMode } from "theme-ui"
import t from "../gatsby-plugin-theme-ui"
import { Global } from "@emotion/core"

const darkThemeGlobalStyles = {
  "html, body": {
    background: t.colors.modes.dark.background,
    color: t.colors.modes.dark.text.primary,
  },
  "h1, h2, h3, h4, h5, h6": {
    color: t.colors.modes.dark.text.header,
  },
  blockquote: {
    borderColor: t.colors.modes.dark.ui.border.subtle,
  },
  hr: {
    backgroundColor: t.colors.modes.dark.ui.border.subtle,
  },
  ".main-body a": {
    color: t.colors.modes.dark.link.color,
    borderVottom: `1px solid ${t.colors.modes.dark.link.border}`,
  },
  ".main-body a:hover": {
    borderBottomColor: t.colors.modes.dark.link.linkHoverBorder,
  },

  // gatsby-remark-prismjs styles
  ".gatsby-highlight, .gatsby-code-title": {
    background: t.colors.modes.dark.code.bg,
    color: t.colors.modes.dark.text.primary,
    borderColor: t.colors.modes.dark.code.border,
  },

  ".gatsby-code-title": {
    color: t.colors.modes.dark.text.secondary,
  },

  ".gatsby-highlight-code-line": {
    background: t.colors.modes.dark.code.lineHighlightBackground,
    borderLeft: `${t.space[1]} solid
      ${t.colors.modes.dark.code.lineHighlightBorder}`,
  },

  ".token.comment, .token.block-comment, .token.prolog, .token.doctype, .token.cdata": {
    color: t.colors.modes.dark.code.comment,
  },
  ".token.punctuation": {
    color: t.colors.modes.dark.code.punctuation,
  },
  ".token.property, .token.tag, .token.boolean, .token.number, .token.function-name, .token.constant, .token.symbol": {
    color: t.colors.modes.dark.code.tag,
  },
  ".token.selector, .token.attr-name, .token.string, .token.char, .token.function, .token.builtin": {
    color: t.colors.modes.dark.code.selector,
  },
  ".token.operator, .token.entity, .token.url, .token.variable": {},
  ".token.atrule, .token.attr-value, .token.keyword, .token.class-name": {
    color: t.colors.modes.dark.code.keyword,
  },
  ".token.inserted": {
    color: t.colors.modes.dark.code.add,
  },
  ".token.deleted": {
    color: t.colors.modes.dark.code.remove,
  },
  ".token.regex, .token.important": {
    color: t.colors.modes.dark.code.regex,
  },
  ".language-css .token.string, .style .token.string": {
    color: t.colors.modes.dark.code.cssString,
  },
  ".namespace": {
    opacity: 0.7,
  },
  // PrismJS plugin styles
  ".token.tab:not(:empty):before, .token.cr:before, .token.lf:before": {
    color: t.colors.modes.dark.code.invisibles,
  },

  "th, td": {
    borderColor: t.colors.modes.dark.ui.border.subtle,
  },

  "tt, code, kbd": {
    background: t.colors.modes.dark.code.bgInline,
    paddingTop: `0.2em`,
    paddingBottom: `0.2em`,
  },
}

const DarkThemeStyles = () => {
  const [colorMode] = useColorMode()

  return colorMode === `dark` ? (
    <Global styles={darkThemeGlobalStyles} />
  ) : (
    false
  )
}

export default DarkThemeStyles
