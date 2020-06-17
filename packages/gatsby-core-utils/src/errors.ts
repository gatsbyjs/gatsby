import { prepareStackTrace } from "./prepare-stack-trace"

export class ErrorWithCodeFrame extends Error {
  codeFrame: string

  constructor(...args) {
    super(...args)
    this.codeFrame = ``
  }
}

/**
 * Convert a stringified webpack compilation error back into
 * an Error instance so it can be formatted properly
 */
export async function createErrorFromString(
  errorStr: string = ``,
  sourceMapFile: string
): Promise<Error | ErrorWithCodeFrame> {
  let [message, ...rest] = errorStr.split(/\r\n|[\n\r]/g)
  // pull the message from the first line then remove the `Error:` prefix
  // FIXME: when https://github.com/AriaMinaei/pretty-error/pull/49 is merged

  message = message.replace(/^(Error:)/, ``)

  const error = new Error(message)

  error.stack = [message, rest.join(`\n`)].join(`\n`)

  error.name = `WebpackError`
  try {
    if (sourceMapFile) {
      return await prepareStackTrace(error, sourceMapFile)
    }
  } catch (err) {
    // don't shadow a real error because of a parsing issue
  }
  return error
}
