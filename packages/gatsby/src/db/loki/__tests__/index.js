const { colls, getDb, start } = require(`../index`)

describe(`db`, () => {
  start()
  it(`should create system collections`, () => {
    const db = getDb()
    const nodeMetaColl = db.getCollection(colls.nodeMeta.name)
    const nodeTypesColl = db.getCollection(colls.nodeTypes.name)
    expect(nodeMetaColl).toBeDefined()
    expect(nodeTypesColl).toBeDefined()
  })
})
