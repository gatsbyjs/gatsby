const runHeaderFunctions = require(`../run-header-functions.js`)

describe(`runHeaderFunctions`, () => {
  it(`return identical array with executed functions`, async done => {
    const headers = {
      key_string: `string`,
      key_function: () => `string`,
      key_function_async: async () => `string`,
    }
    const headers_expected = {
      key_string: `string`,
      key_function: `string`,
      key_function_async: `string`,
    }
    expect(runHeaderFunctions(headers)).resolves.toStrictEqual(headers_expected)
    done()
  })
})
