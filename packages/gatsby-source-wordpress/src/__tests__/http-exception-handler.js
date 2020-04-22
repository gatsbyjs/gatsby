const httpExceptionHandler = require(`../http-exception-handler`)

describe(`http-exception-handler`, () => {
  it(`handles errors that lack responses without crashing`, () => {
    expect(() => httpExceptionHandler({})).not.toThrowError()
  })
})
