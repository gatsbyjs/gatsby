const normalize = require(`../normalize`)

let entities = require(`./data.json`)

describe(`Process Lever data`, () => {
  it(`Creates entities from object collections of entities`, () => {
    entities = normalize.normalizeEntities(entities)
  })
  it(`Standardizes ids & cleans keys`, () => {
    entities = normalize.standardizeKeys(entities)
    expect(entities).toMatchSnapshot()
  })
  it(`Converts to use only GMT dates`, () => {
    entities = normalize.standardizeDates(entities)
    expect(entities).toMatchSnapshot()
  })
  it(`creates Gatsby IDs for each entity`, () => {
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)
    entities = normalize.createGatsbyIds(createNodeId, entities)
    expect(entities).toMatchSnapshot()
  })
  it(`creates nodes for each entry`, () => {
    const createNode = jest.fn()
    normalize.createNodesFromEntities({ entities, createNode })
    expect(createNode.mock.calls).toMatchSnapshot()
  })
})

describe(`getValidKey`, () => {
  it(`It passes a key through untouched that passes`, () => {
    expect(
      normalize.getValidKey({
        key: `hi`,
      })
    ).toBe(`hi`)
  })
  it(`It prefixes keys that start with numbers`, () => {
    expect(
      normalize.getValidKey({
        key: `0hi`,
      })
    ).toBe(`lever_0hi`)
  })
  it(`It prefixes keys that conflict with default Gatsby fields`, () => {
    expect(
      normalize.getValidKey({
        key: `children`,
      })
    ).toBe(`lever_children`)
  })
  it(`It replaces invalid characters`, () => {
    expect(
      normalize.getValidKey({
        key: `h:i`,
      })
    ).toBe(`h_i`)
  })
})
