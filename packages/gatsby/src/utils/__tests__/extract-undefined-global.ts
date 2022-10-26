import { extractUndefinedGlobal } from "../extract-undefined-global"

const globals = [
  `window`,
  `document`,
  `localStorage`,
  `navigator`,
  `alert`,
  `location`,
]

it.each(globals)(`extracts %s`, global => {
  const extractedGlobal = extractUndefinedGlobal(
    new ReferenceError(`${global} is not defined`)
  )

  expect(extractedGlobal).toEqual(global)
})

it(`returns an empty string if no known global found`, () => {
  const extractedGlobal = extractUndefinedGlobal(
    new ReferenceError(`foo is not defined`)
  )

  expect(extractedGlobal).toEqual(``)
})
