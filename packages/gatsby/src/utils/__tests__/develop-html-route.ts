import { parseError } from "../render-dev-html-child"
import error from "./fixtures/error-object"

describe(`error parsing`, () => {
  it(`returns an object w/ the parsed error & codeframe`, () => {
    expect(parseError(error, __dirname)).toMatchSnapshot()
  })
})
