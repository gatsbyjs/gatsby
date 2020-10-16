import { parseError } from "../develop-html-route"
import error from "./fixtures/error-object"

describe(`error parsing`, () => {
  it(`returns an object w/ the parsed error & codeframe`, () => {
    expect(parseError(error, __dirname)).toMatchSnapshot()
  })
})
