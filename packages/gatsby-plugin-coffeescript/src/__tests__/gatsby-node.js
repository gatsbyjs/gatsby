const {
  resolvableExtensions,
  modifyWebpackConfig,
  preprocessSource,
} = require(`../gatsby-node`)

describe(`gatsby-plugin-coffeescript`, () => {
  it(`contains coffee script extensions`, () => {
    expect(resolvableExtensions()).toMatchSnapshot()
  })

  it(`modifies webpack config with cofeescript extensions`, () => {
    const spy = jest.fn()
    const config = {
      loader(...args) {
        spy(...args)
      },
    }

    modifyWebpackConfig({ config })

    expect(spy).toHaveBeenCalledTimes(resolvableExtensions().length)
  })

  describe(`pre processing`, () => {
    it(`returns null if non-coffeescript file`, () => {
      expect(
        preprocessSource({
          filename: `test.js`,
          contents: `alert('hello');`,
        })
      ).toBe(null)
    })

    it(`transforms .coffee files`, () => {
      expect(
        preprocessSource(
          {
            filename: `test.coffee`,
            contents: `alert "I knew it!" if elvis?`,
          },
          {}
        )
      ).toMatchSnapshot()
    })

    it(`transforms .cjsx files`, () => {
      expect(
        preprocessSource(
          {
            filename: `test.cjsx`,
            contents: `
          React = require('react');

          module.exports = class extends React.Component {
            render: ->
              <div>
                <h1>Hello World</h1>
              </div>
          }
        `,
          },
          {}
        )
      ).toMatchSnapshot()
    })
  })
})
