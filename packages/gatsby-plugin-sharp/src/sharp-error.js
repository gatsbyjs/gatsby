// This custom error should help us debug sharp errors when occuring.

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
${err.message}`
    }

    super(fullErrorMessage)

    this.name = `SharpError`
    Error.captureStackTrace(this, SharpError)
  }
}
