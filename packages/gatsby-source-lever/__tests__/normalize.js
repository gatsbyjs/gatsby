var normalize = require(`../normalize`);

var entities = require(`./data.json`);

describe(`Process Lever data`, function () {
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
  it(`creates Gatsby IDs for each entity`, function () {
    var createNodeId = jest.fn();
    createNodeId.mockReturnValue(`uuid-from-gatsby`);
    entities = normalize.createGatsbyIds(createNodeId, entities);
    expect(entities).toMatchSnapshot();
  });
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
    })).toBe(`lever_0hi`);
  });
  it(`It prefixes keys that conflict with default Gatsby fields`, function () {
    expect(normalize.getValidKey({
      key: `children`
    })).toBe(`lever_children`);
  });
  it(`It replaces invalid characters`, function () {
    expect(normalize.getValidKey({
      key: `h:i`
    })).toBe(`h_i`);
  });
});