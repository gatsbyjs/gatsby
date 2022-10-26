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
      test({
        code: `import { graphql } from "gatsby"\nimport Template from './Template'\nconst query = graphql\`test\`\nexport { query }\nexport default Template`,
      }),
      test({
        code: `import { graphql } from "gatsby"\nexport { default } from './Template'\nexport const query = graphql\`test\``,
      }),
      test({
        code: `import { graphql } from "gatsby"\nconst query = graphql\`test\`\nexport { query }\nexport { default } from './Template'`,
      }),
      test({
        code: `import { graphql } from "gatsby"\nexport { Template as default } from './Template'\nexport const query = graphql\`test\``,
      }),
      // getServerData
      test({
        code: `import { graphql, Link } from "gatsby"\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template\nexport function getServerData() { return { props: { foo: "bar" }}}`,
      }),
      test({
        code: `import { graphql, Link } from "gatsby"\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template\nexport async function getServerData() { return { props: { foo: "bar" }}}`,
      }),
      test({
        code: `import { graphql, Link } from "gatsby"\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template\nexport const getServerData = () => { return { props: { foo: "bar" }}}`,
      }),
      test({
        code: `import { graphql, Link } from "gatsby"\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template\nexports.getServerData = () => { return { props: { foo: "bar" }}}`,
      }),
      // config
      test({
        code: `import { graphql, Link } from "gatsby"\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template\nexport function config() { return ({ params }) => { defer: true }}`,
      }),
      test({
        code: `import { graphql, Link } from "gatsby"\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template\nexport async function config() { const { data } = graphql\`test\`\nreturn ({ params }) => { defer: true }}`,
      }),
      test({
        code: `import { graphql, Link } from "gatsby"\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template\nexport const config = () => { return ({ params }) => { defer: true }}`,
      }),
      test({
        code: `import { graphql, Link } from "gatsby"\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template\nexports.config = () => { return ({ params }) => { defer: true }}`,
      }),
      test({
        code: `import { graphql, Link } from "gatsby"\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template\nexport class Head extends React.Component { render() { return null } }`,
      }),
      test({
        code: `import { graphql, Link } from "gatsby"\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template\nexport const Head = () => { return null }`,
      }),
      test({
        code: `import { graphql, Link } from "gatsby"\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template\nexport { Head } from "./somewhere"`,
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
      test({
        code: `import { graphql } from "gatsby"\nexport { default } from './Template'\nexport const hello = 10, query = graphql\`test\``,
        errors: [{ messageId: `limitedExportsPageTemplates` }],
      }),
      test({
        code: `import { graphql } from "gatsby"\nconst query = graphql\`test\`\nexport { query }\nexport { default } from './Template'\nexport function Test() {}`,
        errors: [{ messageId: `limitedExportsPageTemplates` }],
      }),
      test({
        code: `import { graphql } from "gatsby"\nexport { Template as default } from './Template'\nexport const query = graphql\`test\`\nexport function Test() {}`,
        errors: [{ messageId: `limitedExportsPageTemplates` }],
      }),
      test({
        code: `import { graphql, Link } from "gatsby"\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template\nexport class NotHead extends React.Component { render() { return null } }`,
        errors: [{ messageId: `limitedExportsPageTemplates` }],
      }),
      test({
        code: `import { graphql, Link } from "gatsby"\nconst Template = () => {}\nexport const query = graphql\`test\`\nexport default Template\nexport { NotHead } from "./somewhere"`,
        errors: [{ messageId: `limitedExportsPageTemplates` }],
      }),
    ],
  })
})
