import { RuleTester } from "eslint"
import { test } from "../../eslint-rules-helpers"
const rule = require(`../limited-exports-page-templates`)

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
      test({
        code: `import { graphql, Link } from "gatsby"\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template`,
      }),
      test({
        code: `const { graphql } = require("gatsby")\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template`,
      }),
      test({
        code: `const { graphql } = require(\`gatsby\`)\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template`,
      }),
      test({
        code: `const { graphql: wat } = require("gatsby")\nconst Template = () => {}\nexport const query = wat\`test\`\nexport default Template`,
      }),
      test({
        code: `const { graphql: wat } = require(\`gatsby\`)\nconst Template = () => {}\nexport const query = wat\`test\`\nexport default Template`,
      }),
      test({
        code: `import { graphql as wat, Link } from "gatsby"\nconst Template = () => {}\nexport const query = wat\`test\`\nexport default Template`,
      }),
      test({
        code: `import * as Gatsby from "gatsby"\nconst Template = () => {}\nexport const query = Gatsby.graphql\`test\`\nexport default Template`,
      }),
      test({
        code: `const Template = () => {}\nexport default Template`,
      }),
      test({
        code: `import graphql from "graphql-tag"\nconst Template = () => {}\nconst stuff = graphql\`test\`\nexport default Template`,
      }),
      test({
        code: `import { graphql } from "gatsby"\nconst Template = () => {}\nconst query = graphql\`test\`\nexport { query }\nexport default Template`,
      }),
    ],
    invalid: [
      test({
        code: `import { graphql } from "gatsby"\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport function Test() {}\nexport default Template`,
        errors: [{ messageId: `limitedExportsPageTemplates` }],
      }),
      test({
        code: `import graphql from "gatsby"\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template`,
        errors: [{ messageId: `limitedExportsPageTemplates` }],
      }),
      test({
        code: `import graphql from "graphql-tag"\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template`,
        errors: [{ messageId: `limitedExportsPageTemplates` }],
      }),
      test({
        code: `import { graphql as wat } from "gatsby"\nimport graphql from "graphql-tag"\nconst Template = () => {}\nexport const query = wat\`test\`\nexport const query2 = graphql\`test2\`\nexport default Template`,
        errors: [{ messageId: `limitedExportsPageTemplates` }],
      }),
      test({
        code: `import { graphql } from "gatsby"\nconst Template = () => {}\nconst query = graphql\`test\`\nfunction Test() {}\nexport { query, Test }\nexport default Template`,
        errors: [{ messageId: `limitedExportsPageTemplates` }],
      }),
      test({
        code: `import { graphql } from "gatsby"\nconst Template = () => {}\nexport const query = graphql\`test\`, hello = 10\nexport default Template`,
        errors: [{ messageId: `limitedExportsPageTemplates` }],
      }),
      test({
        code: `import * as Gatsby from "gatsby"\nconst Template = () => {}\nexport const query = Gatsby.graphql\`test\`, hello = 10\nexport default Template`,
        errors: [{ messageId: `limitedExportsPageTemplates` }],
      }),
      test({
        code: `import { graphql } from "gatsby"\nconst Template = () => {}\nexport const hello = 10, query = graphql\`test\`\nexport default Template`,
        errors: [{ messageId: `limitedExportsPageTemplates` }],
      }),
    ],
  })
})
