const colorized = require(`./output-color`)

/**
 * Handles HTTP Exceptions (axios)
 *
 * @param {any} e
 */
function httpExceptionHandler(e) {
  const { status, statusText, data: { message } } = e.response
  console.log(
    colorized.out(
      `The server response was "${status} ${statusText}"`,
      colorized.color.Font.FgRed
    )
  )
  if (message) {
    console.log(
      colorized.out(
        `Inner exception message : "${message}"`,
        colorized.color.Font.FgRed
      )
    )
  }
}

module.exports = httpExceptionHandler
