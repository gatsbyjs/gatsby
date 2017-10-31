"use strict"

import { injectGlobal } from "emotion"

const colors = {
  dark: `#282c34`,
  white: `#ffffff`,
}

const prismColors = {
  char: `#D8DEE9`,
  comment: `#999999`,
  keyword: `#c5a5c5`,
  lineHighlight: `#14161a`,
  primitive: `#5a9bcf`,
  string: `#8dc891`,
  variable: `#d7deea`,
  boolean: `#ff8b50`,
  punctuation: `#5FB3B3`,
  tag: `#fc929e`,
  function: `#79b6f2`,
  className: `#FAC863`,
  method: `#6699CC`,
  operator: `#fc929e`,
}

injectGlobal`.gatsby-highlight {
  background: ${colors.dark};
  color: ${colors.white};
  border-radius: 1em;
  overflow: auto;
  tab-size: 1.5em;
  padding: 1em;
  margin: 1em 0;
}`

injectGlobal`
.gatsby-highlight code[class*="language-"],
.gatsby-highlight pre[class*="language-"]
  {
    height: auto !important;
    margin: 1rem;
    font-size: 14px;
    line-height: 20px;
    white-space: pre-wrap;
    word-break: break-word;
  }`

injectGlobal`code {
  font-size: 1em;
  font-family: 'Source Code Pro', monospace; 
}`

injectGlobal`.gatsby-highlight + .gatsby-highlight {
  margin-top: 1.250em;
}`

injectGlobal`.gatsby-highlight-code-line {
  background-color: ${prismColors.lineHighlight};
  display: block;
  margin: -0.125rem calc(-1rem - 15px);
  padding: 0.125rem calc(1rem + 15px);
}`

injectGlobal`.token.attr-name {
  color: ${prismColors.keyword};
}`

injectGlobal`
.token.comment,
.token.block-comment,
.token.prolog,
.token.doctype,
.token.cdata
  {
    color: ${prismColors.comment};
  }`

injectGlobal`
.token.property,
.token.number,
.token.function-name,
.token.constant,
.token.symbol,
.token.deleted
  {
    color: ${prismColors.primitive};
  }`

injectGlobal`.token.boolean {
  color: ${prismColors.boolean};
}`

injectGlobal`span.token.tag {
  color: ${prismColors.tag};
}`

injectGlobal`.token.string {
  color: ${prismColors.string};
}`

injectGlobal`.token.punctuation {
  color: ${prismColors.punctuation};
}`

injectGlobal`
.token.selector,
.token.char,
.token.builtin,
.token.inserted
  {
    color: ${prismColors.char};
  }`

injectGlobal`.token.function {
  color: ${prismColors.function};
}`

injectGlobal`
.token.operator,
.token.entity,
.token.url,
.token.variable
  {
    color: ${prismColors.variable};
  }`

injectGlobal`token.attr-value {
  color: ${prismColors.string};
}`

injectGlobal`.token.keyword {
  color: ${prismColors.keyword};
}`

injectGlobal`
.token.atrule,
.token.class-name
  {
    color: ${prismColors.className};
  }`

injectGlobal`.token.important {
  font-weight: 400;
}`

injectGlobal`.token.bold {
  font-weight: 700;
}`

injectGlobal`.token.italic {
  font-style: italic;
}`

injectGlobal`.token.entity {
  cursor: help;
}`

injectGlobal`.namespace {
  opacity: 0.7;
}`
