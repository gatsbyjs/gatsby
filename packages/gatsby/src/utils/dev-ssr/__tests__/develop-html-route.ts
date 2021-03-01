import * as os from "os"
import { parseError } from "../render-dev-html-child"
import error from "./fixtures/error-object"

describe(`error parsing`, () => {
  it(`returns an object w/ the parsed error & codeframe`, () => {
    // stack traces have real paths so \\, the fixture does not have them
    if (os.platform() === `win32`) {
      error.stack = error.stack.replace(/\//g, `\\`)
    }

    const parsedError = parseError({
      err: error,
      directory: __dirname,
      componentPath: __filename,
    })

    expect(parsedError).toMatchObject({
      filename: `fixtures/blog-post.js`,
      message: `window is not defined`,
      type: `ReferenceError`,
      stack: expect.any(String),
    })
  })
})
