import { transform } from "@babel/core"
import preset from "babel-preset-gatsby"
import plugin from "../optimize-hook-destructuring"

const trim = s => s.join(`\n`).trim().replace(/^\s+/gm, ``)

const babel = code =>
  transform(code, {
    filename: `noop.js`,
    presets: [preset],
    plugins: [plugin],
    babelrc: false,
    configFile: false,
    sourceType: `module`,
    compact: true,
    caller: {
      name: `tests`,
      supportsStaticESM: true,
    },
  }).code

describe(`optimize-hook-destructuring`, () => {
  it(`should transform Array-destructured hook return values use object destructuring`, () => {
    const output = babel(
      trim`
      import { useState } from 'react';
      const [count, setCount] = useState(0);
    `
    )

    expect(output).toMatch(trim`
    \"use strict\";var _react=require(\"react\");const{0:count,1:setCount}=(0,_react.useState)(0);
    `)

    expect(output).toMatchInlineSnapshot(
      `"\\"use strict\\";var _react=require(\\"react\\");const{0:count,1:setCount}=(0,_react.useState)(0);"`
    )
  })
})
