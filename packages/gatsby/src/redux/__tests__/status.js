const { actions, boundActions } = require(`../actions`)
const statusReducer = require(`../reducers/status`)

Date.now = jest.fn(() => 1482363367071)

describe(`Status actions/reducer`, () => {
  it(`allows setting plugin status`, () => {
    expect(
      actions.setPluginStatus({ something: `test status` })
    ).toMatchSnapshot()
  })

  it(`allows updating status`, () => {
    let state = statusReducer(
      undefined,
      actions.setPluginStatus({ test: `test status` }, { name: `test-plugin` })
    )
    state = statusReducer(
      state,
      actions.setPluginStatus({ test: `test status2` }, { name: `test-plugin` })
    )
    expect(state.plugins[`test-plugin`].test).toEqual(`test status2`)
  })

  it(`throws an error if status isn't an object`, done => {
    function runReducer() {
      return statusReducer(
        undefined,
        actions.setPluginStatus(`test job`, { name: `test-plugin` })
      )
    }

    expect(runReducer).toThrowErrorMatchingSnapshot()
    done()
  })

  it(`throws an error if the plugin name isn't set`, done => {
    function runReducer() {
      return statusReducer(
        undefined,
        actions.setPluginStatus({ blah: `test job` })
      )
    }

    expect(runReducer).toThrowErrorMatchingSnapshot()
    done()
  })
})
