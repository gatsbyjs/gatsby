const normalize = require(`../normalize`)

let entities = require(`./data.json`)

describe(`Process WordPress data`, () => {
  let entityTypes
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
  it(`Lifts all "rendered" fields to top-level`, () => {
    entities = normalize.liftRenderedField(entities)
    expect(entities).toMatchSnapshot()
  })
  it(`excludes unknown entities`, () => {
    entities = normalize.excludeUnknownEntities(entities)
  })
  it(`creates Gatsby IDs for each entity`, () => {
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)
    entities = normalize.createGatsbyIds(createNodeId, entities)
    expect(entities).toMatchSnapshot()
  })
  it(`Creates map of types`, () => {
    entityTypes = normalize.mapTypes(entities)
    expect(entityTypes).toMatchSnapshot()
  })
  it(`Creates links between authors and user entities`, () => {
    entities = normalize.mapAuthorsToUsers(entities)
    expect(entities).toMatchSnapshot()
  })
  it(`Creates links between posts and tags/categories`, () => {
    entities = normalize.mapPostsToTagsCategories(entities)
    expect(entities).toMatchSnapshot()
  })

  it(`Creates links between tags/categories and taxonomies`, () => {
    entities = normalize.mapTagsCategoriesToTaxonomies(entities)
    expect(entities).toMatchSnapshot()
  })

  it(`Creates links from entities to media nodes`, () => {
    entities = normalize.mapEntitiesToMedia(entities)
    expect(entities).toMatchSnapshot()
  })
  it(`Removes the acf key when acf is not an object`, () => {
    let dummyEntities = [{ id: 1, acf: false }, { id: 2, acf: {} }]
    expect(normalize.normalizeACF(dummyEntities)).toEqual([
      { id: 1 },
      { id: 2, acf: {} },
    ])
  })

  // Actually let's not test this since it's a bit tricky to mock
  // as it needs access to the store/cache + would download file.
  // it(`Downloads media files and removes "sizes" data as useless in Gatsby context`, () => {
  // entities = await normalize.downloadMediaFiles(entities)
  // expect(entities).toMatchSnapshot()
  // })

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
    ).toBe(`wordpress_0hi`)
  })
  it(`It prefixes keys that conflict with default Gatsby fields`, () => {
    expect(
      normalize.getValidKey({
        key: `children`,
      })
    ).toBe(`wordpress_children`)
  })
  it(`It replaces invalid characters`, () => {
    expect(
      normalize.getValidKey({
        key: `h:i`,
      })
    ).toBe(`h_i`)
  })
})
