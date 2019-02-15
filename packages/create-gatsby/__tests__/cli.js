jest.mock('gatsby-cli/lib/create-cli', () => jest.fn())
const createCli = require(`gatsby-cli/lib/create-cli`)
const createGatsbyCli = require(`../cli`)

beforeEach(() => {
  createCli.mockClear()
})

test(`it forwards arguments to gatsby-cli`, () => {
  const args = [`new`, `my-gatsby-app`, `--leeoroy`, `--jenkins`]

  createGatsbyCli(args)

  expect(createCli).toHaveBeenCalledWith(args)
})

test(`it throws if new command not specified`, () => {
  const args = [`gatsby-app`]

  expect(() => createGatsbyCli(args)).toThrowErrorMatchingSnapshot()
})
