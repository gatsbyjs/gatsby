/*
  Jest is resetting `global` between test suites. This makes our global maps that track opened
  dbs unusable. This custom environment is really just regular Node environment, but it does setup
  global available in tests with SHARED maps within same process (different processes will use different
  dbs, so that part is taken care of)
*/
const NodeEnvironment = require(`jest-environment-node`)

const GlobalsToPreserve = [`__GATSBY_OPEN_ROOT_LMDBS`, `__GATSBY_OPEN_LMDBS`]

const preservedGlobals = new Map<string, unknown>()

class CustomEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context)
  }

  async setup(): Promise<void> {
    await super.setup()
    for (const globalToCheck of GlobalsToPreserve) {
      this.global[globalToCheck] = preservedGlobals.get(globalToCheck)
    }
  }

  async teardown(): Promise<void> {
    for (const globalToCheck of GlobalsToPreserve) {
      preservedGlobals.set(globalToCheck, this.global[globalToCheck])
    }
    await super.teardown()
  }
}

module.exports = CustomEnvironment
