module.exports = (
  code = [],
  highlightLines = [],
  user = `root`,
  host = `localhost`,
  text = ``
) => {
  const generatePrompts = numberOfLines => {
    let prompts = ``
    for (let i = 0; i < numberOfLines; i++) {
      if (highlightLines.includes(i + 1)) {
        prompts += `<span></span>`
      } else {
        if (text) {
          let escapedText = text.replace('>', '&gt;')
          prompts += `<span data-prompt="${escapedText}"></span>`
        } else {
          prompts += `<span data-user=${user} data-host=${host}></span>`
        }
      }
    }
    return prompts
  }

  const numberOfLines = code.length === 0 ? 0 : code.split(`\n`).length

  const promptsWrapper =
    `<span class="command-line-prompt">` +
    `${generatePrompts(numberOfLines)}` +
    `</span>`
  return promptsWrapper
}
