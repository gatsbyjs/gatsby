import { RuleTester } from "eslint"
import path from "path"

import Rule from "../no-direct-react-imports"

const ruleTester = new RuleTester()

const options = [
  {
    replacementImportLocation: path.posix.join(__dirname, "local-react"),
  },
]

const ESMerrors = [
  {
    messageId: "directReactImport",
    type: "ImportDeclaration",
  },
]

const CJSerrors = [
  {
    messageId: "directReactImport",
    type: "CallExpression",
  },
]

const inSameDir = path.posix.join(__dirname, "test.js")
const inDifferentDir = path.posix.join(__dirname, "dir1", "dir2", "test.js")

ruleTester.run("no-direct-react-imports", Rule, {
  valid: [
    {
      code: `import React from "not-react"`,
      parserOptions: { ecmaVersion: 6, sourceType: "module" },
    },
    {
      code: `const React = require("not-react")`,
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `const React = require('not-react')`,
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `const React = require(\`not-react\`)`,
      parserOptions: { ecmaVersion: 6 },
    },
  ],
  invalid: [
    {
      code: `import ReactInSameDir from "react"`,
      output: `import ReactInSameDir from "./local-react"`,
      options,
      filename: inSameDir,
      parserOptions: { ecmaVersion: 6, sourceType: "module" },
      errors: ESMerrors,
    },
    {
      code: `import ReactInDifferentDir from "react"`,
      output: `import ReactInDifferentDir from "../../local-react"`,
      options,
      filename: inDifferentDir,
      parserOptions: { ecmaVersion: 6, sourceType: "module" },
      errors: ESMerrors,
    },
    {
      code: `const ReactInSameDir = require("react")`,
      output: `const ReactInSameDir = require("./local-react")`,
      options,
      filename: inSameDir,
      parserOptions: { ecmaVersion: 6 },
      errors: CJSerrors,
    },
    {
      code: `const ReactInDifferentDir = require("react")`,
      output: `const ReactInDifferentDir = require("../../local-react")`,
      options,
      filename: inDifferentDir,
      parserOptions: { ecmaVersion: 6 },
      errors: CJSerrors,
    },
    {
      code: `const ReactInSameDir = require('react')`,
      output: `const ReactInSameDir = require('./local-react')`,
      options,
      filename: inSameDir,
      parserOptions: { ecmaVersion: 6 },
      errors: CJSerrors,
    },
    {
      code: `const ReactInDifferentDir = require('react')`,
      output: `const ReactInDifferentDir = require('../../local-react')`,
      options,
      filename: inDifferentDir,
      parserOptions: { ecmaVersion: 6 },
      errors: CJSerrors,
    },
    {
      code: `const ReactInSameDir = require(\`react\`)`,
      output: `const ReactInSameDir = require(\`./local-react\`)`,
      options,
      filename: inSameDir,
      parserOptions: { ecmaVersion: 6 },
      errors: CJSerrors,
    },
    {
      code: `const ReactInDifferentDir = require(\`react\`)`,
      output: `const ReactInDifferentDir = require(\`../../local-react\`)`,
      options,
      filename: inDifferentDir,
      parserOptions: { ecmaVersion: 6 },
      errors: CJSerrors,
    },
  ],
})
