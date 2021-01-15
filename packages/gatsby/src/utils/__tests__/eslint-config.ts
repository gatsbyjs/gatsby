import { mergeRequiredConfigIn } from "../eslint-config"
import { CLIEngine } from "eslint"
import * as path from "path"

describe(`eslint-config`, () => {
  describe(`mergeRequiredConfigIn`, () => {
    it(`adds rulePaths and extends if those don't exist`, () => {
      const conf: CLIEngine.Options = {}

      mergeRequiredConfigIn(conf)

      expect(conf?.baseConfig).toMatchInlineSnapshot(`
        Object {
          "extends": Array [
            "<PROJECT_ROOT>/packages/gatsby/src/utils/eslint/required.js",
          ],
        }
      `)

      expect(conf.rulePaths).toMatchInlineSnapshot(`
        Array [
          "<PROJECT_ROOT>/packages/gatsby/src/utils/eslint-rules",
        ]
      `)
    })

    it(`adds rulePath if rulePaths exist but don't contain required rules`, () => {
      const conf: CLIEngine.Options = {
        rulePaths: [`test`],
      }

      mergeRequiredConfigIn(conf)

      expect(conf.rulePaths).toMatchInlineSnapshot(`
        Array [
          "test",
          "<PROJECT_ROOT>/packages/gatsby/src/utils/eslint-rules",
        ]
      `)
    })

    it(`doesn't add rulePath multiple times`, () => {
      const conf: CLIEngine.Options = {
        rulePaths: [path.resolve(__dirname, `../eslint-rules`), `test`],
      }

      mergeRequiredConfigIn(conf)

      expect(conf.rulePaths).toMatchInlineSnapshot(`
        Array [
          "<PROJECT_ROOT>/packages/gatsby/src/utils/eslint-rules",
          "test",
        ]
      `)
    })

    it(`adds extend if extends exist (array) but don't contain required preset`, () => {
      const conf: CLIEngine.Options = {
        baseConfig: {
          extends: [`ext1`],
        },
      }

      mergeRequiredConfigIn(conf)

      expect(conf.baseConfig).toMatchInlineSnapshot(`
        Object {
          "extends": Array [
            "ext1",
            "<PROJECT_ROOT>/packages/gatsby/src/utils/eslint/required.js",
          ],
        }
      `)
    })

    it(`adds extend if extends exist (string) but don't contain required preset`, () => {
      const conf: CLIEngine.Options = {
        baseConfig: {
          extends: `ext1`,
        },
      }

      mergeRequiredConfigIn(conf)

      expect(conf.baseConfig).toMatchInlineSnapshot(`
        Object {
          "extends": Array [
            "ext1",
            "<PROJECT_ROOT>/packages/gatsby/src/utils/eslint/required.js",
          ],
        }
      `)
    })

    it(`doesn't add extend multiple times (extends is array)`, () => {
      const conf: CLIEngine.Options = {
        baseConfig: {
          extends: [require.resolve(`../eslint/required`), `ext1`],
        },
      }

      mergeRequiredConfigIn(conf)

      expect(conf.baseConfig).toMatchInlineSnapshot(`
        Object {
          "extends": Array [
            "<PROJECT_ROOT>/packages/gatsby/src/utils/eslint/required.js",
            "ext1",
          ],
        }
      `)
    })

    it(`doesn't add extend multiple times (extends is string)`, () => {
      const conf: CLIEngine.Options = {
        baseConfig: {
          extends: require.resolve(`../eslint/required`),
        },
      }

      mergeRequiredConfigIn(conf)

      expect(conf.baseConfig).toMatchInlineSnapshot(`
        Object {
          "extends": "<PROJECT_ROOT>/packages/gatsby/src/utils/eslint/required.js",
        }
      `)
    })
  })
})
