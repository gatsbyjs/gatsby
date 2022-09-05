const NodeEnvironment = require(`jest-environment-node`)

class CustomEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context)
  }

  async teardown(): Promise<void> {
    // close open lmdbs after running test suite
    // this prevent dangling open handles that sometimes cause problems
    // particularly in windows tests (failures to move or delete a db file)
    if (this.global.__GATSBY_OPEN_ROOT_LMDBS) {
      for (const rootDb of this.global.__GATSBY_OPEN_ROOT_LMDBS.values()) {
        await rootDb.clearAsync()
        await rootDb.close()
      }
      this.global.__GATSBY_OPEN_ROOT_LMDBS = undefined
    }
    await super.teardown()
  }
}

module.exports = CustomEnvironment
