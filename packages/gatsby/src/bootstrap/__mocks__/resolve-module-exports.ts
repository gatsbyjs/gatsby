"use strict"

let mockResults = {}

export const resolveModuleExports = (
  input: unknown
): Array<string> | undefined => {
  // return a mocked result
  if (typeof input === `string`) {
    return mockResults[input]
  }

  // return default result
  if (typeof input !== `object`) {
    return []
  }

  // set mock results
  mockResults = Object.assign({}, input)
  return undefined
}
