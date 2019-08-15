const constructError = require(`../construct-error`)

let log
let processExit
beforeEach(() => {
  log = jest.spyOn(console, `log`).mockImplementation(() => {})
  processExit = jest.spyOn(process, `exit`).mockImplementation(() => {})

  log.mockReset()
  processExit.mockReset()
})

afterAll(() => {
  console.log.mockClear()
  process.exit.mockClear()
})

test(`it exits on invalid error schema`, () => {
  constructError({ details: { context: {}, lol: `invalid` } })

  expect(processExit).toHaveBeenCalledWith(1)
})

test(`it logs error on invalid schema`, () => {
  constructError({ details: { context: {}, lol: `invalid` } })

  expect(log).toHaveBeenCalledWith(
    `Failed to validate error`,
    expect.any(Object)
  )
})

test(`it passes through on valid error schema`, () => {
  constructError({ details: { context: {} } })

  expect(log).not.toHaveBeenCalled()
})
