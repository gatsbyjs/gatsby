import { isPriorityBuild } from "../src/helpers"
import { mockPluginOptions, makeMockEnvironment } from "./fixtures"

function generateTestName(prioritize, environment): string {
  return `Returns proper value when prioritize is ${prioritize} and environment is '${environment}'`
}

const pluginOptions = mockPluginOptions()
const mockEnvironment = makeMockEnvironment()

describe(`isPriorityBuild`, () => {
  for (const prioritize of [undefined, false, true]) {
    for (const environment of [`none`, `gatsby`, `netlify`, `all`]) {
      it(generateTestName(prioritize, environment), () => {
        // @ts-ignore
        mockEnvironment(environment)

        const expectedValue = (): boolean => {
          if (prioritize !== undefined) return prioritize
          return environment !== `none`
        }

        // @ts-ignore
        expect(isPriorityBuild({ ...pluginOptions, prioritize })).toEqual(
          expectedValue(),
        )
      })
    }
  }
})
