import { transform } from "@babel/core"
import preset from "babel-preset-gatsby-package"

const trim = s =>
  s
    .join(`\n`)
    .trim()
    .replace(/^\s+/gm, ``)

const babel = (code, esm = false) =>
  transform(code, {
    filename: `noop.js`,
    presets: [preset],
    babelrc: false,
    configFile: false,
    sourceType: `module`,
    compact: true,
    caller: {
      name: `tests`,
      supportsStaticESM: esm,
    },
  }).code

describe(`optimize-hook-destructuring`, () => {
  it(`should transform Array-destructured hook return values use object destructuring`, () => {
    const output = babel(
      trim`
      import { useState } from 'react';
      const [count, setCount] = useState(0);
    `,
      true
    )

    expect(output).toMatch(trim`
      var _useState=useState(0),count=_useState[0],setCount=_useState[1];
    `)

    expect(output).toMatchInlineSnapshot(
      `"import{useState}from'react';var _useState=useState(0),count=_useState[0],setCount=_useState[1];"`
    )
  })
})
