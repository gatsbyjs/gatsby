describe(`isTTY`, () => {
  let originalTTY: boolean
  beforeEach(() => {
    jest.resetModules()

    originalTTY = process.stdout.isTTY
  })
  afterEach(() => {
    process.stdout.isTTY = originalTTY
  })

  it(`returns true if not on ci & TTY is enabled`, () => {
    process.stdout.isTTY = true
    jest.mock(`gatsby-core-utils`, () => {
      return { isCI: (): boolean => false }
    })
    const { isTTY } = require(`../is-tty`)
    expect(isTTY()).toBe(true)
  })

  it(`returns false if not on ci & TTY is disabled`, () => {
    process.stdout.isTTY = false
    jest.mock(`gatsby-core-utils`, () => {
      return { isCI: (): boolean => false }
    })
    const { isTTY } = require(`../is-tty`)
    expect(isTTY()).toBe(false)
  })

  it(`returns false if on ci & TTY is enabled`, () => {
    process.stdout.isTTY = true
    jest.mock(`gatsby-core-utils`, () => {
      return { isCI: (): boolean => true }
    })
    const { isTTY } = require(`../is-tty`)
    expect(isTTY()).toBe(false)
  })

  it(`returns false if on ci & TTY is disabled`, () => {
    process.stdout.isTTY = false
    jest.mock(`gatsby-core-utils`, () => {
      return { isCI: (): boolean => true }
    })
    const { isTTY } = require(`../is-tty`)
    expect(isTTY()).toBe(false)
  })
})
