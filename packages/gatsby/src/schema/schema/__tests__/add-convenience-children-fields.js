const { TypeComposer } = require(`graphql-compose`)

const addConvenienceChildrenFields = require(`../add-convenience-children-fields`)

jest.mock(`../../db`, () => {
  const nodes = [
    {
      id: 1,
      parent: null,
      children: [2, 3],
      internal: { type: `Parent` },
    },
    {
      id: 2,
      parent: 1,
      children: [],
      internal: { type: `Child` },
    },
    {
      id: 3,
      parent: 1,
      children: [],
      internal: { type: `Child` },
    },
    {
      id: 4,
      parent: null,
      children: [5, 6],
      internal: { type: `SingleParent` },
    },
    {
      id: 5,
      parent: 4,
      children: [],
      internal: { type: `Child` },
    },
    {
      id: 6,
      parent: 4,
      children: [],
      internal: { type: `AnotherChild` },
    },
  ]
  return {
    getById: id => nodes.find(node => node.id === id),
    getNodesByType: type => nodes.filter(node => node.internal.type === type),
  }
})

const ChildTC = TypeComposer.create(`type Child { id: Int }`)
const ParentTC = TypeComposer.create(`type Parent { id: Int }`)
const SingleParentTC = TypeComposer.create(`type SingleParent { id: Int }`)

describe(`Add convenience children fields`, () => {
  it(`adds field for single child`, () => {
    addConvenienceChildrenFields(SingleParentTC)
    expect(SingleParentTC.getFieldNames()).toEqual([
      `id`,
      `childChild`,
      `childAnotherChild`,
    ])
  })

  it(`adds field for children`, () => {
    addConvenienceChildrenFields(ParentTC)
    expect(ParentTC.getFieldNames()).toEqual([`id`, `childrenChild`])
  })

  it(`does not add field when no children present`, () => {
    addConvenienceChildrenFields(ChildTC)
    expect(ChildTC.getFieldNames()).toEqual([`id`])
  })
})
