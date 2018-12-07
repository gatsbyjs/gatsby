const visit = require(`unist-util-visit`)

const parseLineNumberRange = require(`./parse-line-number-range`)
const highlightCode = require(`./highlight-code`)
const addLineNumbers = require(`./add-line-numbers`)

module.exports = (
  { markdownAST },
  {
    classPrefix = `language-`,
    inlineCodeMarker = null,
    aliases = {},
    noInlineHighlight = false,
    showLineNumbers: showLineNumbersGlobal = false,
  } = {}
) => {
  const normalizeLanguage = lang => {
    const lower = lang.toLowerCase()
    return aliases[lower] || lower
  }

  visit(markdownAST, `code`, node => {
    let language = node.lang
    let {
      splitLanguage,
      highlightLines,
      showLineNumbersLocal,
      numberLinesStartAt,
    } = parseLineNumberRange(language)
    const showLineNumbers = showLineNumbersLocal || showLineNumbersGlobal
    language = splitLanguage

    // PrismJS's theme styles are targeting pre[class*="language-"]
    // to apply its styles. We do the same here so that users
    // can apply a PrismJS theme and get the expected, ready-to-use
    // outcome without any additional CSS.
    //
    // @see https://github.com/PrismJS/prism/blob/1d5047df37aacc900f8270b1c6215028f6988eb1/themes/prism.css#L49-L54
    let languageName = `text`
    if (language) {
      languageName = normalizeLanguage(language)
    }

    // Allow users to specify a custom class prefix to avoid breaking
    // line highlights if Prism is required by any other code.
    // This supports custom user styling without causing Prism to
    // re-process our already-highlighted markup.
    // @see https://github.com/gatsbyjs/gatsby/issues/1486
    const className = `${classPrefix}${languageName}`

    let numLinesStyle, numLinesClass, numLinesNumber
    numLinesStyle = numLinesClass = numLinesNumber = ``
    if (showLineNumbers) {
      numLinesStyle = ` style="counter-reset: linenumber ${numberLinesStartAt -
        1}"`
      numLinesClass = ` line-numbers`
      numLinesNumber = addLineNumbers(node.value)
    }

    // Replace the node with the markup we need to make
    // 100% width highlighted code lines work
    node.type = `html`
    // prettier-ignore
    node.value = ``
    + `<div class="gatsby-highlight" data-language="${languageName}">`
    +   `<pre${numLinesStyle} class="${className}${numLinesClass}">`
    +     `<code class="${className}">`
    +       `${highlightCode(language, node.value, highlightLines)}`
    +     `</code>`
    +     `${numLinesNumber}`
    +   `</pre>`
    + `</div>`
  })

  if (!noInlineHighlight) {
    visit(markdownAST, `inlineCode`, node => {
      let languageName = `text`

      if (inlineCodeMarker) {
        let [language, restOfValue] = node.value.split(`${inlineCodeMarker}`, 2)
        if (language && restOfValue) {
          languageName = normalizeLanguage(language)
          node.value = restOfValue
        }
      }

      const className = `${classPrefix}${languageName}`

      node.type = `html`
      node.value = `<code class="${className}">${highlightCode(
        languageName,
        node.value
      )}</code>`
    })
  }
}
