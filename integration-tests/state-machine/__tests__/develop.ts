import { resolve } from "path"

import express from "mock-express"
import { developMachine } from "gatsby/internal"
import { interpret } from "xstate"

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
}

describe(`the develop state machine`, () => {
  const machine = developMachine.withContext({
    app: express,
    program,
  })

  const service = interpret(machine)
  service.start()
  expect(service.state.value).toEqual("waiting")
})
