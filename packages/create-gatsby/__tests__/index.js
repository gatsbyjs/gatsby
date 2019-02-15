jest.mock(`../cli`, () => jest.fn())
const cli = require(`../cli`)

beforeEach(() => {
  cli.mockClear()
})

const getCreateGatsbyCli = argv => {
  process.argv = argv

  return require(`../`)
}

test(`it invokes the cli`, () => {
  const args = ['new', 'gatsby-project']
  getCreateGatsbyCli(args)

  expect(cli).toHaveBeenCalledWith(args)
  expect(cli).toHaveBeenCalledTimes(1)
})
