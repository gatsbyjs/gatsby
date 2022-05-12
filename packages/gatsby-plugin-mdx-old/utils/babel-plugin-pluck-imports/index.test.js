const Plugin = require(`.`)

const babel = require(`@babel/core`)

const testContents = `import React from "react";
import { graphql } from "gatsby";

export default ({ children }) => <div>{children}</div>;

export const pageQuery = graphql\`
  query MDXWhatever {
    name
  }
\`;
`

describe(`babel-plugin-pluck-imports`, () => {
  test(`plucks imports`, () => {
    const instance = new Plugin()
    const result = babel.transform(testContents, {
      configFile: false,
      plugins: [instance.plugin],
      presets: [require(`@babel/preset-react`)],
    })

    expect(result.code).toEqual(`export default (({
  children
}) => /*#__PURE__*/React.createElement("div", null, children));
export const pageQuery = graphql\`
  query MDXWhatever {
    name
  }
\`;`)
  })

  test(`yields list of imports`, () => {
    const instance = new Plugin()
    babel.transform(testContents, {
      plugins: [instance.plugin],
      presets: [require(`@babel/preset-react`)],
    })

    expect(instance.state.imports).toEqual([
      `import React from "react";`,
      `import { graphql } from "gatsby";`,
    ])
  })
  test(`yields list of local identifiers`, () => {
    const instance = new Plugin()
    babel.transform(testContents, {
      plugins: [instance.plugin],
      presets: [require(`@babel/preset-react`)],
    })

    expect(instance.state.identifiers).toEqual([`React`, `graphql`])
  })
})
