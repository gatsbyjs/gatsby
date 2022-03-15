import { isPriorityBuild } from "../src/helpers"

import { makeMockEnvironment } from "./mocks"

const generateTestName = (prioritize, environment): string =>
  `Returns proper value when prioritize is ${prioritize} and environment is '${environment}'`

const mockEnvironment = makeMockEnvironment()

describe(`isPriorityBuild`, () => {
  for (const prioritize of [undefined, false, true]) {
    for (const environment of [`none`, `gatsby`, `netlify`, `all`]) {
      it(generateTestName(prioritize, environment), () => {
        const pluginOptions = { prioritize }
        mockEnvironment(environment)

        const expectedValue = (): boolean => {
          if (prioritize !== undefined) return prioritize
          return environment !== `none`
        }

        expect(isPriorityBuild(pluginOptions)).toEqual(expectedValue())
      })
    }
  }
})
