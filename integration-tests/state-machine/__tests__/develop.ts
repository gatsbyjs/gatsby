import { resolve } from "path"
import express from "mock-express"
import { developMachine } from "gatsby/internal"
import { interpret, Interpreter, State, StateValue } from "xstate"

jest.setTimeout(60000)

const program = {
  _: `develop`,
  port: 8000,
  directory: resolve(__dirname, `..`),
  useYarn: true,
  proxyPort: 8000,
  host: `localhost`,
  openTracingConfigFile: ``,
  sitePackageJson: {},
  verbose: true,
  open: false,
}

const whenStateEquals = (
  stateValue: StateValue | Array<StateValue>,
  service: Interpreter<any>
) =>
  new Promise(resolve => {
    function handler(state: State<any>) {
      if (
        Array.isArray(stateValue)
          ? stateValue.includes(state.value)
          : stateValue === state.value
      ) {
        service.off(handler)
        resolve()
      }
    }
    service.onTransition(handler)
  })

const timeout = (delay = 0) =>
  new Promise(resolve => setTimeout(resolve, delay))

describe(`the develop state machine`, () => {
  it(`builds`, async () => {
    process.env.NODE_ENV = `development`
    const machine = developMachine.withContext({
      app: express(),
      program,
    })

    const service = interpret(machine)
    service.start()
    await whenStateEquals("waiting", service)
    expect(service.state.value).toEqual(`waiting`)
    service.send("TERMINATE")
    await timeout(1000)
  })
})
