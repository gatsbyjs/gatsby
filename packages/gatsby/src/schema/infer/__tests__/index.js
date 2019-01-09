const { schemaComposer } = require(`graphql-compose`)

const { addInferredType, addInferredTypes } = require(`..`)

jest.mock(`../../db`, () => {
  const nodes = [
    {
      id: 1,
      parent: null,
      children: [2],
      internal: { type: `Foo` },
      foo: true,
    },
    {
      id: 2,
      parent: 1,
      children: [3],
      internal: { type: `Bar` },
      bar: true,
    },
    {
      id: 3,
      parent: 2,
      children: [],
      internal: { type: `Baz` },
      baz: true,
    },
  ]
  return {
    getNodesByType: type => nodes.filter(n => n.internal.type === type),
    getTypes: () =>
      Array.from(
        nodes.reduce(
          (acc, node) => acc.add(node.internal.type) || acc,
          new Set()
        )
      ),
  }
})

const { getExampleValue } = require(`../example-value`)
jest.mock(`../example-value`, () => ({
  getExampleValue: jest.fn().mockReturnValue({}),
}))

describe(`Type inference`, () => {
  beforeEach(() => {
    schemaComposer.clear()
  })

  it(`processes all node types`, () => {
    addInferredTypes()
    expect(schemaComposer.has(`Foo`)).toBeTruthy()
    expect(schemaComposer.has(`Bar`)).toBeTruthy()
    expect(schemaComposer.has(`Baz`)).toBeTruthy()
  })

  it(`ignores Node interface fields`, () => {
    addInferredType(`Foo`)
    expect(getExampleValue).toHaveBeenCalledWith(
      expect.objectContaining({
        ignoreFields: [`id`, `parent`, `children`, `internal`],
      })
    )
  })
})
