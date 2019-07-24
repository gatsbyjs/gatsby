const { getNodesCollection, start } = require(`../index`)
const { getNodeTypeCollection } = require(`../nodes`)

describe(`Loki Nodes Collections`, () => {
  beforeAll(() => {
    start()
  })

  it(`should create view for single type types`, () => {
    const nodesColl = getNodesCollection()
    const view = getNodeTypeCollection(`MyType`)
    expect(view).toBe(getNodeTypeCollection(`MyType`))
    expect(view).toBe(nodesColl.getDynamicView(view.name))
  })

  it(`should create view for multi-type types`, () => {
    const nodesColl = getNodesCollection()
    const view = getNodeTypeCollection([`MyType`, `MySecondType`])
    expect(view).toBe(getNodeTypeCollection([`MySecondType`, `MyType`]))
    expect(view).toBe(nodesColl.getDynamicView(view.name))
  })
})
