import { structureWebpackErrors } from "../webpack-error-utils"
import { Stage } from "../../commands/types"

describe(`structureWebpackErrors`, () => {
  const stages: Array<Stage> = [
    Stage.BuildJavascript,
    Stage.BuildHTML,
    Stage.DevelopHTML,
    Stage.Develop,
  ]

  describe.each(stages)(`stage: %s`, (stage: Stage) => {
    it(`Can't resolve (98124)`, () => {
      const error = new Error(`Can't resolve 'wat.js' in 'foo.js'`) as any
      error.module = { resource: `foo.js` }
      error.error = {
        loc: {
          line: 5,
          column: 10,
        },
      }
      let structuredError = structureWebpackErrors(stage, error)
      if (Array.isArray(structuredError)) {
        structuredError = structuredError[0]
      }

      expect(structuredError).toMatchSnapshot()
      expect(structuredError.context.stageLabel).not.toBeUndefined()
      expect(structuredError.context.stage).not.toBeUndefined()
    })
  })
})
