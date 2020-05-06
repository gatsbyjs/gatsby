const { onCreateBabelConfig } = require(`../gatsby-node`)

describe(`gastby-plugin-react-css-modules`, () => {
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

  it(`should plugins from plugin options`, () => {
    expect(actions.setBabelPlugin.mock.calls[0].plugins).not.toBeDefined()
  })
})
