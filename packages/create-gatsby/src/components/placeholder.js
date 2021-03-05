/**
 * This file is taken almost unchanged from enquirer, because it's not exported from the module
 */

const isPrimitive = val =>
  val != null && typeof val !== `object` && typeof val !== `function`

/**
 * Render a placeholder value with cursor and styling based on the
 * position of the cursor.
 *
 * @param {Object} `prompt` Prompt instance.
 * @param {String} `input` Input string.
 * @param {String} `initial` The initial user-provided value.
 * @param {Number} `pos` Current cursor position.
 * @param {Boolean} `showCursor` Render a simulated cursor using the inverse primary style.
 * @return {String} Returns the styled placeholder string.
 * @api public
 */

export default (prompt, options = {}) => {
  prompt.cursorHide()

  let { input = ``, initial = ``, pos, showCursor = true, color } = options
  const style = color || prompt.styles.placeholder
  const inverse = prompt.styles.primary.inverse
  let blinker = str => inverse(str)
  let output = input
  const char = ` `
  let reverse = blinker(char)

  if (prompt.blink && prompt.blink.off === true) {
    blinker = str => str
    reverse = ``
  }

  if (showCursor && pos === 0 && initial === `` && input === ``) {
    return blinker(char)
  }

  if (showCursor && pos === 0 && (input === initial || input === ``)) {
    return blinker(initial[0]) + style(initial.slice(1))
  }

  initial = isPrimitive(initial) ? `${initial}` : ``
  input = isPrimitive(input) ? `${input}` : ``

  const placeholder = initial && initial.startsWith(input) && initial !== input
  let cursor = placeholder ? blinker(initial[input.length]) : reverse

  if (pos !== input.length && showCursor === true) {
    output = input.slice(0, pos) + blinker(input[pos]) + input.slice(pos + 1)
    cursor = ``
  }

  if (showCursor === false) {
    cursor = ``
  }

  if (placeholder) {
    const raw = prompt.styles.unstyle(output + cursor)
    return output + cursor + style(initial.slice(raw.length))
  }

  return output + cursor
}
