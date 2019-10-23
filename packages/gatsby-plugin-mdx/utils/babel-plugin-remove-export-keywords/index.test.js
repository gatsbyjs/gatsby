const babel = require(`@babel/core`)

const plugin = require(`.`)

const testContents = `
export const foo = 'bar';
/** @jsx mdx*/ export const _frontmatter = {
  title: "Here's a title with the word export"
};

const MDXContent = function () {};
export { MDXContent as default };
`
const expectedResults = `const foo = 'bar';
/** @jsx mdx*/

const _frontmatter = {
  title: "Here's a title with the word export"
};

const MDXContent = function () {};

export { MDXContent as default };`

describe(`babel-plugin-remove-export-keyword`, () => {
  test(`removes all export keywords`, () => {
    const result = babel.transform(testContents, {
      configFile: false,
      plugins: [plugin],
      presets: [require(`@babel/preset-react`)],
    })

    expect(result.code).toEqual(expectedResults)
  })
})
