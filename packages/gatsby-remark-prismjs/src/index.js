const visit = require(`unist-util-visit`)

const parseLineNumberRange = require(`./parse-line-number-range`)
const highlightCode = require(`./highlight-code`)

module.exports = ({ markdownAST }, { useDataAttribute = false } = {}) => {
  visit(markdownAST, `code`, node => {
    let language = node.lang
    let { splitLanguage, highlightLines } = parseLineNumberRange(language)
    language = splitLanguage

    // PrismJS's theme styles are targeting pre[class*="language-"]
    // to apply its styles. We do the same here so that users
    // can apply a PrismJS theme and get the expected, ready-to-use
    // outcome without any additional CSS.
    //
    // @see https://github.com/PrismJS/prism/blob/1d5047df37aacc900f8270b1c6215028f6988eb1/themes/prism.css#L49-L54
    let languageName = `none`
    if (language) {
      language = language.toLowerCase()
      languageName = language
    }

    // Use a data attribute rather than a class name to avoid breaking
    // line highlights if Prism is required by any other code.
    // The language attribute enables custom user-styling without
    // causing Prism to re-process our already-highlighted markup.
    // @see https://github.com/gatsbyjs/gatsby/issues/1486
    const languageFlag = useDataAttribute
      ? `data-language="${languageName}"`
      : `class="language-${languageName}"`

    // Replace the node with the markup we need to make
    // 100% width highlighted code lines work
    node.type = `html`
    node.value = `<div class="gatsby-highlight">
      <pre ${languageFlag}><code>${highlightCode(
      language,
      node.value,
      highlightLines
    )}</code></pre>
      </div>`
  })
}
