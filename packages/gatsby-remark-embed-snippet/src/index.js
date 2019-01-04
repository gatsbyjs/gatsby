"use strict"

const fs = require(`fs`)
const normalizePath = require(`normalize-path`)
const visit = require(`unist-util-visit`)

const highlightCode = require(`gatsby-remark-prismjs/highlight-code`)

// Language defaults to extension.toLowerCase();
// This map tracks languages that don't match their extension.
const FILE_EXTENSION_TO_LANGUAGE_MAP = {
  js: `jsx`,
  md: `markup`,
  sh: `bash`,
}

const getLanguage = file => {
  if (!file.includes(`.`)) {
    return `none`
  }

  const extension = file.split(`.`).pop()

  return FILE_EXTENSION_TO_LANGUAGE_MAP.hasOwnProperty(extension)
    ? FILE_EXTENSION_TO_LANGUAGE_MAP[extension]
    : extension.toLowerCase()
}

module.exports = (
  { markdownAST },
  { classPrefix = `language-`, directory } = {}
) => {
  if (!directory) {
    throw Error(`Required option "directory" not specified`)
  } else if (!fs.existsSync(directory)) {
    throw Error(`Invalid directory specified "${directory}"`)
  } else if (!directory.endsWith(`/`)) {
    directory += `/`
  }

  visit(markdownAST, `inlineCode`, node => {
    const { value } = node

    if (value.startsWith(`embed:`)) {
      const file = value.substr(6)
      const path = normalizePath(`${directory}${file}`)

      if (!fs.existsSync(path)) {
        throw Error(`Invalid snippet specified; no such file "${path}"`)
      }

      const code = fs.readFileSync(path, `utf8`).trim()

      // PrismJS's theme styles are targeting pre[class*="language-"]
      // to apply its styles. We do the same here so that users
      // can apply a PrismJS theme and get the expected, ready-to-use
      // outcome without any additional CSS.
      //
      // @see https://github.com/PrismJS/prism/blob/1d5047df37aacc900f8270b1c6215028f6988eb1/themes/prism.css#L49-L54
      const language = getLanguage(file)

      // Allow users to specify a custom class prefix to avoid breaking
      // line highlights if Prism is required by any other code.
      // This supports custom user styling without causing Prism to
      // re-process our already-highlighted markup.
      // @see https://github.com/gatsbyjs/gatsby/issues/1486
      const className = language
        .split(` `)
        .map(token => `${classPrefix}${token}`)
        .join(` `)

      // Replace the node with the markup we need to make 100% width highlighted code lines work
      try {
        node.value = `<div class="gatsby-highlight">
        <pre class="${className}"><code>${highlightCode(
          language,
          code
        ).trim()}</code></pre>
        </div>`
        node.type = `html`
      } catch (e) {
        // rethrow error pointing to a file
        throw Error(`${e.message}\nFile: ${file}`)
      }
    }
  })

  return markdownAST
}
