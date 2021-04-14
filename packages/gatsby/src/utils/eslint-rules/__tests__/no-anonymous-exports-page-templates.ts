import { RuleTester } from "eslint"
import { test } from "../../eslint-rules-helpers"
const rule = require(`../no-anonymous-exports-page-templates`)

const parserOptions = {
  ecmaVersion: 2018,
  sourceType: `module`,
  ecmaFeatures: {
    jsx: true,
  },
}

const ruleTester = new RuleTester({ parserOptions })

jest.mock(`../../eslint-rules-helpers`, () => {
  return {
    ...jest.requireActual(`../../eslint-rules-helpers`),
    isPageTemplate: jest.fn().mockReturnValue(true),
  }
})

describe(`no-anonymous-exports-page-templates`, () => {
  ruleTester.run(`passes valid and invalid cases`, rule, {
    valid: [
      // Exports with identifiers are valid
      test({ code: `const Named = () => {}\nexport default Named` }),
      test({ code: `export default function foo() {}` }),
      test({ code: `export default class MyClass {}` }),

      // Sanity check unrelated export syntaxes
      test({ code: `export * from 'foo'` }),
      test({ code: `const foo = 123\nexport { foo }` }),
      test({ code: `const foo = 123\nexport { foo as default }` }),

      // Allow call expressions by default for backwards compatibility
      test({ code: `export default foo(bar)` }),
    ],
    invalid: [
      test({
        code: `export default () => {}`,
        errors: [{ messageId: `anonymousArrowFunction` }],
      }),
      test({
        code: `export default function() {}`,
        errors: [{ messageId: `anonymousFunctionDeclaration` }],
      }),
      test({
        code: `export default class {}`,
        errors: [{ messageId: `anonymousClass` }],
      }),
    ],
  })
})
