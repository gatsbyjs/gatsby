const { printConflicts, reportConflict } = require(`../type-conflict-reporter`)

const { getById } = require(`../../db`)
jest.mock(`../../db`, () => {
  const { trackObjects } = require(`../../utils/node-tracking`)

  const nodes = [
    {
      id: 1,
      internal: {
        type: `Foo`,
        description: `Foo Node`,
      },
      bar: 1,
      nested: {
        bar: 1,
      },
    },
    {
      id: 2,
      internal: {
        type: `Foo`,
        description: `Foo Node`,
      },
      bar: true,
      nested: {
        bar: true,
      },
    },
  ]

  nodes.forEach(trackObjects)

  return {
    getById: id => nodes.find(n => n.id === id),
  }
})

const { warn, log } = require(`gatsby-cli/lib/reporter`)
jest.mock(`gatsby-cli/lib/reporter`)

describe(`Type conflict reporter`, () => {
  beforeEach(() => {
    warn.mockReset()
    log.mockReset()
  })

  it(`prints conflicts and their locations`, () => {
    const selector = `Foo.bar`
    const examples = [
      {
        value: 1,
        type: `number`,
        parent: getById(1),
      },
      {
        value: true,
        type: `boolean`,
        parent: getById(2),
      },
    ]

    reportConflict(selector, examples)
    printConflicts()

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toBeCalledWith(
      expect.stringContaining(`There are conflicting field types in your data.`)
    )
    // Could also use Jest's mock serializer, but that also includes return values,
    // which in this case is just noise.
    // expect(log).toMatchSnapshot()
    expect(log.mock.calls[1]).toMatchSnapshot()
    expect(log.mock.calls[2]).toMatchSnapshot()
  })

  it(`prints conflicts and their locations for nested objects`, () => {
    const selector = `Foo.bar.nested`
    const examples = [
      {
        value: 1,
        type: `number`,
        parent: getById(1).nested,
      },
      {
        value: true,
        type: `boolean`,
        parent: getById(2).nested,
      },
    ]

    reportConflict(selector, examples)
    printConflicts()

    expect(warn).toHaveBeenCalledTimes(1)
    expect(log.mock.calls[1]).toMatchSnapshot()
    expect(log.mock.calls[2]).toMatchSnapshot()
  })
})
