// @ts-check
import {
  buildEntryList,
  buildResolvableSet,
  buildForeignReferenceMap,
  createNodesForContentType,
  createAssetNodes,
  buildFallbackChain,
  getLocalizedField,
  makeId,
} from "../normalize"
import { createPluginConfig } from "../plugin-options"

const {
  currentSyncData,
  contentTypeItems,
  defaultLocale,
  locales,
  space,
} = require(`./data.json`)

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

const pluginConfig = createPluginConfig({})

describe(`Process contentful data (by name)`, () => {
  let entryList
  let resolvable
  let foreignReferenceMap

  it(`builds entry list`, () => {
    entryList = buildEntryList({
      mergedSyncData: currentSyncData,
      contentTypeItems,
    })
    expect(entryList).toMatchSnapshot()
  })

  it(`builds list of resolvable data`, () => {
    resolvable = buildResolvableSet({
      assets: currentSyncData.assets,
      entryList,
    })
    expect(resolvable).toMatchSnapshot()
  })

  it(`builds foreignReferenceMap`, () => {
    foreignReferenceMap = buildForeignReferenceMap({
      contentTypeItems,
      entryList,
      resolvable,
      defaultLocale,
      space,
      useNameForId: true,
    })
    expect(foreignReferenceMap).toMatchSnapshot()
  })

  it(`creates nodes for each entry`, () => {
    const createNode = jest.fn()
    const createNodeId = jest.fn(id => id)
    const getNode = jest.fn(() => undefined) // All nodes are new
    contentTypeItems.forEach((contentTypeItem, i) => {
      createNodesForContentType({
        contentTypeItem,
        restrictedNodeFields,
        conflictFieldPrefix,
        entries: entryList[i],
        createNode,
        createNodeId,
        getNode,
        resolvable,
        foreignReferenceMap,
        defaultLocale,
        locales,
        space,
        useNameForId: true,
        pluginConfig,
      })
    })
    expect(createNode.mock.calls).toMatchSnapshot()

    // Relevant to compare to compare warm and cold situation. Actual number not relevant.
    expect(createNode.mock.calls.length).toBe(74) // "cold build entries" count
  })

  it(`creates nodes for each asset`, () => {
    const createNode = jest.fn(() => Promise.resolve())
    const createNodeId = jest.fn(id => id)
    const assets = currentSyncData.assets
    assets.forEach(assetItem => {
      createAssetNodes({
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

describe(`Skip existing nodes in warm build`, () => {
  it(`creates nodes for each entry`, () => {
    const entryList = buildEntryList({
      mergedSyncData: currentSyncData,
      contentTypeItems,
    })

    const resolvable = buildResolvableSet({
      assets: currentSyncData.assets,
      entryList,
    })

    const foreignReferenceMap = buildForeignReferenceMap({
      contentTypeItems,
      entryList,
      resolvable,
      defaultLocale,
      space,
      useNameForId: true,
    })

    const createNode = jest.fn()
    const createNodeId = jest.fn(id => id)
    let doReturn = true
    const getNode = jest.fn(id => {
      if (doReturn) {
        doReturn = false
        // Note: the relevant part for this test is that the same digest is returned
        // so it skips generating the node and any of its children. Actual shape of
        // returned is not relevant to test so update if anything breaks.
        return {
          id,
          internal: { contentDigest: entryList[0][0].sys.updatedAt },
        }
      }
      // All other nodes are new ("unknown")
      return undefined
    })
    contentTypeItems.forEach((contentTypeItem, i) => {
      createNodesForContentType({
        contentTypeItem,
        restrictedNodeFields,
        conflictFieldPrefix,
        entries: entryList[i],
        createNode,
        createNodeId,
        getNode,
        resolvable,
        foreignReferenceMap,
        defaultLocale,
        locales,
        space,
        useNameForId: true,
        pluginConfig,
      })
    })
    expect(createNode.mock.calls).toMatchSnapshot()

    // Relevant to compare to compare warm and cold situation. Actual number not relevant.
    // This number ought to be less than the cold build
    expect(createNode.mock.calls.length).toBe(71) // "warm build where entry was not changed" count
  })

  it(`creates nodes for each asset`, () => {
    const createNode = jest.fn(() => Promise.resolve())
    const createNodeId = jest.fn(id => id)
    const assets = currentSyncData.assets
    assets.forEach(assetItem => {
      createAssetNodes({
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

describe(`Process existing mutated nodes in warm build`, () => {
  it(`creates nodes for each entry`, () => {
    const entryList = buildEntryList({
      mergedSyncData: currentSyncData,
      contentTypeItems,
    })

    const resolvable = buildResolvableSet({
      assets: currentSyncData.assets,
      entryList,
    })

    const foreignReferenceMap = buildForeignReferenceMap({
      contentTypeItems,
      entryList,
      resolvable,
      defaultLocale,
      space,
      useNameForId: true,
    })

    const createNode = jest.fn()
    const createNodeId = jest.fn(id => id)
    let doReturn = true
    const getNode = jest.fn(id => {
      if (doReturn) {
        doReturn = false
        // Note: the relevant part for this test is that the same digest is returned
        // so it skips generating the node and any of its children. Actual shape of
        // returned is not relevant to test so update if anything breaks.
        return {
          id,
          internal: {
            contentDigest: entryList[0][0].sys.updatedAt + `changed`,
          },
        }
      }
      // All other nodes are new ("unknown")
      return undefined
    })
    contentTypeItems.forEach((contentTypeItem, i) => {
      createNodesForContentType({
        contentTypeItem,
        restrictedNodeFields,
        conflictFieldPrefix,
        entries: entryList[i],
        createNode,
        createNodeId,
        getNode,
        resolvable,
        foreignReferenceMap,
        defaultLocale,
        locales,
        space,
        useNameForId: true,
        pluginConfig,
      })
    })
    expect(createNode.mock.calls).toMatchSnapshot()

    // Relevant to compare to compare warm and cold situation. Actual number not relevant.
    // This number ought to be the same as the cold build
    expect(createNode.mock.calls.length).toBe(74) // "warm build where entry was changed" count
  })

  it(`creates nodes for each asset`, () => {
    const createNode = jest.fn(() => Promise.resolve())
    const createNodeId = jest.fn(id => id)
    const assets = currentSyncData.assets
    assets.forEach(assetItem => {
      createAssetNodes({
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

describe(`Process contentful data (by id)`, () => {
  let entryList
  let resolvable
  let foreignReferenceMap

  it(`builds entry list`, () => {
    entryList = buildEntryList({
      mergedSyncData: currentSyncData,
      contentTypeItems,
    })
    expect(entryList).toMatchSnapshot()
  })

  it(`builds list of resolvable data`, () => {
    resolvable = buildResolvableSet({
      assets: currentSyncData.assets,
      entryList,
    })
    expect(resolvable).toMatchSnapshot()
  })

  it(`builds foreignReferenceMap`, () => {
    foreignReferenceMap = buildForeignReferenceMap({
      contentTypeItems,
      entryList,
      resolvable,
      defaultLocale,
      space,
      useNameForId: false,
    })
    expect(foreignReferenceMap).toMatchSnapshot()
  })

  it(`creates nodes for each entry`, () => {
    const createNode = jest.fn()
    const createNodeId = jest.fn(id => id)
    const getNode = jest.fn(() => undefined) // All nodes are new
    contentTypeItems.forEach((contentTypeItem, i) => {
      createNodesForContentType({
        contentTypeItem,
        restrictedNodeFields,
        conflictFieldPrefix,
        entries: entryList[i],
        createNode,
        createNodeId,
        getNode,
        resolvable,
        foreignReferenceMap,
        defaultLocale,
        locales,
        space,
        useNameForId: false,
        pluginConfig,
      })
    })
    expect(createNode.mock.calls).toMatchSnapshot()
  })

  it(`creates nodes for each asset`, () => {
    const createNode = jest.fn(() => Promise.resolve())
    const createNodeId = jest.fn(id => id)
    const assets = currentSyncData.assets
    assets.forEach(assetItem => {
      createAssetNodes({
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
  const localesFallback = buildFallbackChain(locales)
  it(`Gets the specified locale`, () => {
    expect(
      getLocalizedField({
        field,
        localesFallback,
        locale: {
          code: `en-US`,
        },
      })
    ).toBe(field[`en-US`])
    expect(
      getLocalizedField({
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
      getLocalizedField({
        field: falseyField,
        localesFallback,
        locale: {
          code: `en-US`,
        },
      })
    ).toBe(falseyField[`en-US`])

    expect(
      getLocalizedField({
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
      getLocalizedField({
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
      getLocalizedField({
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
      getLocalizedField({
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
      makeId({
        spaceId: `spaceId`,
        id: `id`,
        type: `type`,
        defaultLocale: `en-US`,
        currentLocale: `en-US`,
      })
    ).toBe(`spaceId___id___type`)
  })
  it(`It does postfix the spaceId and the id if its not the default locale`, () => {
    expect(
      makeId({
        spaceId: `spaceId`,
        id: `id`,
        type: `type`,
        defaultLocale: `en-US`,
        currentLocale: `en-GB`,
      })
    ).toBe(`spaceId___id___type___en-GB`)
  })
})
