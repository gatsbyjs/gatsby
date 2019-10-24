const normalize = require(`../normalize`)
const {
  currentSyncData,
  contentTypeItems,
  defaultLocale,
  locales,
  space,
} = require(`./data.json`)

let entryList
let resolvable
let foreignReferenceMap
const conflictFieldPrefix = `contentful_test`
// restrictedNodeFields from here https://www.gatsbyjs.org/docs/node-interface/
const restrictedNodeFields = [
  `id`,
  `children`,
  `contentful_id`,
  `parent`,
  `fields`,
  `internal`,
]

describe(`Process contentful data`, () => {
  it(`builds entry list`, () => {
    entryList = normalize.buildEntryList({
      currentSyncData,
      contentTypeItems,
    })
    expect(entryList).toMatchSnapshot()
  })

  it(`builds list of resolvable data`, () => {
    resolvable = normalize.buildResolvableSet({
      assets: currentSyncData.assets,
      entryList,
      defaultLocale,
      locales,
    })
    expect(resolvable).toMatchSnapshot()
  })

  it(`builds foreignReferenceMap`, () => {
    foreignReferenceMap = normalize.buildForeignReferenceMap({
      contentTypeItems,
      entryList,
      resolvable,
      defaultLocale,
      locales,
      space,
    })
    expect(foreignReferenceMap).toMatchSnapshot()
  })

  it(`creates nodes for each entry`, () => {
    const createNode = jest.fn()
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)
    contentTypeItems.forEach((contentTypeItem, i) => {
      normalize.createContentTypeNodes({
        contentTypeItem,
        restrictedNodeFields,
        conflictFieldPrefix,
        entries: entryList[i].map(normalize.fixIds),
        createNode,
        createNodeId,
        resolvable,
        foreignReferenceMap,
        defaultLocale,
        locales,
        space,
      })
    })
    expect(createNode.mock.calls).toMatchSnapshot()
  })

  it(`creates nodes for each asset`, () => {
    const createNode = jest.fn()
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)
    const assets = currentSyncData.assets
    assets.forEach(assetItem => {
      normalize.createAssetNodes({
        assetItem,
        createNode,
        createNodeId,
        defaultLocale,
        locales,
        space,
      })
    })
    expect(createNode.mock.calls).toMatchSnapshot()
  })
})

describe(`Fix contentful IDs`, () => {
  it(`leaves ids that start with a string the same`, () => {
    expect(normalize.fixId(`a123`)).toEqual(`a123`)
  })
  it(`left pads ids that start with a number of a "c"`, () => {
    expect(normalize.fixId(`123`)).toEqual(`c123`)
  })
})

describe(`Gets field value based on current locale`, () => {
  const field = {
    de: `Playsam Streamliner Klassisches Auto, Espresso`,
    "en-US": `Playsam Streamliner Classic Car, Espresso`,
  }
  const locales = [
    { code: `en-US` },
    { code: `de`, fallbackCode: `en-US` },
    { code: `gsw_CH`, fallbackCode: `de` },
  ]
  const localesFallback = normalize.buildFallbackChain(locales)
  it(`Gets the specified locale`, () => {
    expect(
      normalize.getLocalizedField({
        field,
        localesFallback,
        locale: {
          code: `en-US`,
        },
      })
    ).toBe(field[`en-US`])
    expect(
      normalize.getLocalizedField({
        field,
        localesFallback,
        locale: {
          code: `de`,
        },
      })
    ).toBe(field[`de`])
  })
  it(`Gets the specified locale if the field is falsey`, () => {
    const falseyField = {
      de: 0,
      "en-US": false,
    }
    expect(
      normalize.getLocalizedField({
        field: falseyField,
        localesFallback,
        locale: {
          code: `en-US`,
        },
      })
    ).toBe(falseyField[`en-US`])

    expect(
      normalize.getLocalizedField({
        field: falseyField,
        localesFallback,
        locale: {
          code: `de`,
        },
      })
    ).toBe(falseyField[`de`])
  })
  it(`falls back to the locale's fallback locale if passed a locale that doesn't have a localized field`, () => {
    expect(
      normalize.getLocalizedField({
        field,
        localesFallback,
        locale: {
          code: `gsw_CH`,
        },
      })
    ).toBe(field[`de`])
  })
  it(`returns null if passed a locale that doesn't have a field on a localized field`, () => {
    expect(
      normalize.getLocalizedField({
        field,
        localesFallback: { "es-ES": null, de: null },
        locale: {
          code: `es-US`,
        },
      })
    ).toEqual(null)
  })
  it(`returns null if passed a locale that doesn't have a field nor a fallbackCode`, () => {
    expect(
      normalize.getLocalizedField({
        field,
        localesFallback,
        locale: {
          code: `es-US`,
        },
      })
    ).toEqual(null)
  })
})

describe(`Make IDs`, () => {
  it(`It doesn't postfix the spaceId and the id if its the default locale`, () => {
    expect(
      normalize.makeId({
        spaceId: `spaceId`,
        id: `id`,
        defaultLocale: `en-US`,
        currentLocale: `en-US`,
      })
    ).toBe(`spaceId___id`)
  })
  it(`It does postfix the spaceId and the id if its not the default locale`, () => {
    expect(
      normalize.makeId({
        spaceId: `spaceId`,
        id: `id`,
        defaultLocale: `en-US`,
        currentLocale: `en-GB`,
      })
    ).toBe(`spaceId___id___en-GB`)
  })
})
