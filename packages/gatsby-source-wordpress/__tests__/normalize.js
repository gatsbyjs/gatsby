var normalize = require(`../normalize`);

var entities = require(`./data.json`);

describe(`Process WordPress data`, function () {
  var entityTypes;
  it(`Creates entities from object collections of entities`, function () {
    entities = normalize.normalizeEntities(entities);
  });
  it(`Standardizes ids & cleans keys`, function () {
    entities = normalize.standardizeKeys(entities);
    expect(entities).toMatchSnapshot();
  });
  it(`Converts to use only GMT dates`, function () {
    entities = normalize.standardizeDates(entities);
    expect(entities).toMatchSnapshot();
  });
  it(`Lifts all "rendered" fields to top-level`, function () {
    entities = normalize.liftRenderedField(entities);
    expect(entities).toMatchSnapshot();
  });
  it(`excludes unknown entities`, function () {
    entities = normalize.excludeUnknownEntities(entities);
  });
  it(`creates Gatsby IDs for each entity`, function () {
    var createNodeId = jest.fn();
    createNodeId.mockReturnValue(`uuid-from-gatsby`);
    entities = normalize.createGatsbyIds(createNodeId, entities);
    expect(entities).toMatchSnapshot();
  });
  it(`Creates map of types`, function () {
    entityTypes = normalize.mapTypes(entities);
    expect(entityTypes).toMatchSnapshot();
  });
  it(`Creates links between authors and user entities`, function () {
    entities = normalize.mapAuthorsToUsers(entities);
    expect(entities).toMatchSnapshot();
  });
  it(`Creates links between posts and tags/categories`, function () {
    entities = normalize.mapPostsToTagsCategories(entities);
    expect(entities).toMatchSnapshot();
  });
  it(`Creates links between tags/categories and taxonomies`, function () {
    entities = normalize.mapTagsCategoriesToTaxonomies(entities);
    expect(entities).toMatchSnapshot();
  });
  it(`Creates links from entities to media nodes`, function () {
    entities = normalize.mapEntitiesToMedia(entities);
    expect(entities).toMatchSnapshot();
  });
  it(`Removes the acf key when acf is not an object`, function () {
    var dummyEntities = [{
      id: 1,
      acf: false
    }, {
      id: 2,
      acf: {}
    }];
    expect(normalize.normalizeACF(dummyEntities)).toEqual([{
      id: 1
    }, {
      id: 2,
      acf: {}
    }]);
  }); // Actually let's not test this since it's a bit tricky to mock
  // as it needs access to the store/cache + would download file.
  // it(`Downloads media files and removes "sizes" data as useless in Gatsby context`, () => {
  // entities = await normalize.downloadMediaFiles(entities)
  // expect(entities).toMatchSnapshot()
  // })

  it(`creates nodes for each entry`, function () {
    var createNode = jest.fn();
    normalize.createNodesFromEntities({
      entities,
      createNode
    });
    expect(createNode.mock.calls).toMatchSnapshot();
  });
});
describe(`getValidKey`, function () {
  it(`It passes a key through untouched that passes`, function () {
    expect(normalize.getValidKey({
      key: `hi`
    })).toBe(`hi`);
  });
  it(`It prefixes keys that start with numbers`, function () {
    expect(normalize.getValidKey({
      key: `0hi`
    })).toBe(`wordpress_0hi`);
  });
  it(`It prefixes keys that conflict with default Gatsby fields`, function () {
    expect(normalize.getValidKey({
      key: `children`
    })).toBe(`wordpress_children`);
  });
  it(`It replaces invalid characters`, function () {
    expect(normalize.getValidKey({
      key: `h:i`
    })).toBe(`h_i`);
  });
});