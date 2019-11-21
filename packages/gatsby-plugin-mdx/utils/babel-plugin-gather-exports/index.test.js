const Plugin = require(`.`)

const babel = require(`@babel/core`)
const testContents = `export { value } from './index';
export const hello = 'world';
export const another = {
  exported: "variable"
};
export const pageQuery = graphql\`I am ignored\`;
export const ignoredExpression = 1 + 2;`

describe(`babel-plugin-gather-exports`, () => {
  test(`gathers all exports`, () => {
    const instance = new Plugin()
    const result = babel.transform(testContents, {
      configFile: false,
      plugins: [instance.plugin],
      presets: [require(`@babel/preset-react`)],
    })

    // no change to the contents
    expect(result.code).toEqual(testContents)

    // expect `hello` and `another` to be exported
    expect(instance.state.exports).toEqual({
      hello: `world`,
      another: {
        exported: `variable`,
      },
    })
  })
})
