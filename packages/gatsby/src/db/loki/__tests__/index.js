const {
  getNodesCollection,
  getNodeTypesCollection,
  start,
} = require(`../index`)

describe(`db`, () => {
  beforeAll(() => {
    start()
  })
  it(`should create system collections`, () => {
    const nodesColl = getNodesCollection()
    const nodeTypesColl = getNodeTypesCollection()
    expect(nodesColl).toBeDefined()
    expect(nodeTypesColl).toBeDefined()
  })
})
