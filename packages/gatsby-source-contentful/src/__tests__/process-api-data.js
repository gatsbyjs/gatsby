const processAPIData = require(`../process-api-data`)
const {
  currentSyncData,
  contentTypeItems,
  defaultLocale,
} = require(`./data.json`)

let entryList
let resolvable
let foreignReferenceMap
const conflictFieldPrefix = `contentful_test`
// restrictedNodeFields from here https://www.gatsbyjs.org/docs/node-interface/
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`]

describe(`Process contentful data`, () => {
  it(`builds entry list`, () => {
    entryList = processAPIData.buildEntryList({
      currentSyncData,
      contentTypeItems,
    })
    expect(entryList).toMatchSnapshot()
  })

  it(`builds list of resolvable data`, () => {
    resolvable = processAPIData.buildResolvableSet({
      entryList,
    })
    expect(resolvable).toMatchSnapshot()
  })

  it(`builds foreignReferenceMap`, () => {
    foreignReferenceMap = processAPIData.buildForeignReferenceMap({
      contentTypeItems,
      entryList,
      resolvable,
      defaultLocale,
    })
    expect(foreignReferenceMap).toMatchSnapshot()
  })

  it(`creates nodes for each entry`, () => {
    const createNode = jest.fn()
    contentTypeItems.forEach((contentTypeItem, i) => {
      processAPIData.createContentTypeNodes({
        contentTypeItem,
        restrictedNodeFields,
        conflictFieldPrefix,
        entries: entryList[i],
        createNode,
        resolvable,
        foreignReferenceMap,
        defaultLocale,
      })
    })
    expect(createNode.mock.calls).toMatchSnapshot()
  })

  it(`creates nodes for each asset`, () => {
    const createNode = jest.fn()
    const assets = currentSyncData.assets
    assets.forEach(assetItem => {
      processAPIData.createAssetNodes({ assetItem, createNode, defaultLocale })
    })
    expect(createNode.mock.calls).toMatchSnapshot()
  })
})

describe(`Fix contentful IDs`, () => {
  it(`leaves ids that start with a string the same`, () => {
    expect(processAPIData.fixId(`a123`)).toEqual(`a123`)
  })
  it(`left pads ids that start with a number of a "c"`, () => {
    expect(processAPIData.fixId(`123`)).toEqual(`c123`)
  })
})
