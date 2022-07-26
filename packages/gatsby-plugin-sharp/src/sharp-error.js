// This custom error should help us debug sharp errors when occurring.

export class SharpError extends Error {
  /**
   *
   * @param {string} message
   * @param {Error} err
   */
  constructor(message, err = null) {
    let fullErrorMessage = message

    if (err) {
      fullErrorMessage += `

Original error:
${err.shortMessage ?? ``}
${err.message}`
    }

    super(fullErrorMessage)

    this.name = `SharpError`
    Error.captureStackTrace(this, SharpError)
  }
}
