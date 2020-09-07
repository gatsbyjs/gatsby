const { onCreateBabelConfig } = require(`../gatsby-node`)

describe(`gatsby-plugin-react-css-modules`, () => {
  let actions
  beforeEach(() => {
    actions = {
      setBabelPlugin: jest.fn(),
    }
    onCreateBabelConfig({ actions }, { plugins: jest.fn() })
  })

  it(`should add babel-plugin-react-css-modules plugin to babel config`, () => {
    expect(actions.setBabelPlugin.mock.calls[0]).toMatchSnapshot()
  })

  it(`should not pass plugins to babel plugin config`, () => {
    expect(actions.setBabelPlugin.mock.calls[0].plugins).not.toBeDefined()
  })
})
