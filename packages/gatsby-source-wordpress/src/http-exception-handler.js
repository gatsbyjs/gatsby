const colorized = require(`./output-color`)

/**
 * Handles HTTP Exceptions (axios)
 *
 * @param {any} e
 */
function httpExceptionHandler(e) {
  const { response, code } = e
  if (!response) {
    console.log(
      colorized.out(
        `The request failed with error code "${code}"`,
        colorized.color.Font.FgRed
      )
    )
    return
  }
  console.log(
    colorized.out(
      `\nPath: ${response.request.path}`,
      colorized.color.Font.FgRed
    )
  )
  const {
    status,
    statusText,
    data: { message },
  } = response
  console.log(
    colorized.out(
      `The server response was "${status} ${statusText}"`,
      colorized.color.Font.FgRed
    )
  )
  if (message) {
    console.log(
      colorized.out(
        `Inner exception message: "${message}"`,
        colorized.color.Font.FgRed
      )
    )
  }
}

module.exports = httpExceptionHandler
