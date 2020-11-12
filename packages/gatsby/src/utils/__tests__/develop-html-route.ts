import { parseError } from "../dev-ssr/render-dev-html-child"
import error from "./fixtures/error-object"

describe(`error parsing`, () => {
  it(`returns an object w/ the parsed error & codeframe`, () => {
    expect(
      parseError({
        err: error,
        directory: __dirname,
        componentPath: __filename,
      })
    ).toMatchSnapshot()
  })
})
