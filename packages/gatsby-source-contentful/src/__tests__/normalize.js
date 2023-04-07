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
// restrictedNodeFields from here https://www.gatsbyjs.com/docs/node-interface/
const restrictedNodeFields = [
  `id`,
  `children`,
  `contentful_id`,
  `parent`,
  `fields`,
  `internal`,
]

const pluginConfig = createPluginConfig({})

const unstable_createNodeManifest = jest.fn()

// Counts the created nodes per node type
function countCreatedNodeTypesFromMock(mock) {
  const nodeTypeCounts = {}
  mock.calls.forEach(callArgs => {
    const node = callArgs[0]
    const nodeType = node.internal.type
    if (!nodeTypeCounts[nodeType]) {
      nodeTypeCounts[nodeType] = 0
    }
    nodeTypeCounts[nodeType]++
  })
  return nodeTypeCounts
}

describe(`generic`, () => {
  it(`builds entry list`, () => {
    const entryList = buildEntryList({
      currentSyncData,
      contentTypeItems,
    })

    expect(entryList).toHaveLength(contentTypeItems.length)

    expect(entryList[0][0].sys.contentType.sys.id).toBe(
      `6XwpTaSiiI2Ak2Ww0oi6qa`
    )
    expect(entryList[0]).toHaveLength(2)
    expect(entryList[1][0].sys.contentType.sys.id).toBe(`sFzTZbSuM8coEwygeUYes`)
    expect(entryList[1]).toHaveLength(3)
    expect(entryList[2][0].sys.contentType.sys.id).toBe(
      `2PqfXUJwE8qSYKuM0U6w8M`
    )
    expect(entryList[2]).toHaveLength(4)
    expect(entryList[3][0].sys.contentType.sys.id).toBe(`jsonTest`)
    expect(entryList[3]).toHaveLength(1)

    expect(entryList[4][0].sys.contentType.sys.id).toBe(`remarkTest`)
  })

  it(`builds list of resolvable data`, () => {
    const entryList = buildEntryList({
      currentSyncData,
      contentTypeItems,
    })

    const resolvable = buildResolvableSet({
      assets: currentSyncData.assets,
      entryList,
    })

    const allNodes = [...currentSyncData.entries, ...currentSyncData.assets]

    allNodes.forEach(node =>
      expect(resolvable).toContain(`${node.sys.id}___${node.sys.type}`)
    )
  })
  it(`builds foreignReferenceMap`, () => {
    const entryList = buildEntryList({
      currentSyncData,
      contentTypeItems,
    })

    const resolvable = buildResolvableSet({
      assets: currentSyncData.assets,
      entryList,
    })

    const foreignReferenceMapState = buildForeignReferenceMap({
      contentTypeItems,
      entryList,
      resolvable,
      defaultLocale,
      space,
      useNameForId: true,
      previousForeignReferenceMapState: undefined,
      deletedEntries: [],
    })
    const referenceKeys = Object.keys(foreignReferenceMapState.backLinks)
    const expectedReferenceKeys = [
      `2Y8LhXLnYAYqKCGEWG4EKI___Asset`,
      `3wtvPBbBjiMKqKKga8I2Cu___Asset`,
      `4LgMotpNF6W20YKmuemW0a___Entry`,
      `4zj1ZOfHgQ8oqgaSKm4Qo2___Asset`,
      `6m5AJ9vMPKc8OUoQeoCS4o___Asset`,
      `6t4HKjytPi0mYgs240wkG___Asset`,
      `7LAnCobuuWYSqks6wAwY2a___Entry`,
      `10TkaLheGeQG6qQGqWYqUI___Asset`,
      `24DPGBDeGEaYy8ms4Y8QMQ___Entry`,
      `651CQ8rLoIYCeY6G0QG22q___Entry`,
      `JrePkDVYomE8AwcuCUyMi___Entry`,
      `KTRF62Q4gg60q6WCsWKw8___Asset`,
      `wtrHxeu3zEoEce2MokCSi___Asset`,
      `Xc0ny7GWsMEMCeASWO2um___Asset`,
    ]
    expect(referenceKeys).toHaveLength(expectedReferenceKeys.length)
    expect(referenceKeys).toEqual(expect.arrayContaining(expectedReferenceKeys))

    Object.keys(foreignReferenceMapState.backLinks).forEach(referenceId => {
      expect(resolvable).toContain(referenceId)

      let expectedLength = 1
      if (referenceId === `651CQ8rLoIYCeY6G0QG22q___Entry`) {
        expectedLength = 2
      }
      if (referenceId === `7LAnCobuuWYSqks6wAwY2a___Entry`) {
        expectedLength = 3
      }
      expect(foreignReferenceMapState.backLinks[referenceId]).toHaveLength(
        expectedLength
      )
    })
  })
})

describe(`Process contentful data (by name)`, () => {
  it(`builds foreignReferenceMap`, () => {
    const entryList = buildEntryList({
      currentSyncData,
      contentTypeItems,
    })

    const resolvable = buildResolvableSet({
      assets: currentSyncData.assets,
      entryList,
    })

    const foreignReferenceMapState = buildForeignReferenceMap({
      contentTypeItems,
      entryList,
      resolvable,
      defaultLocale,
      space,
      useNameForId: true,
      previousForeignReferenceMapState: undefined,
      deletedEntries: [],
    })

    expect(
      foreignReferenceMapState.backLinks[`24DPGBDeGEaYy8ms4Y8QMQ___Entry`][0]
        .name
    ).toBe(`product___NODE`)

    expect(
      foreignReferenceMapState.backLinks[`2Y8LhXLnYAYqKCGEWG4EKI___Asset`][0]
        .name
    ).toBe(`brand___NODE`)
  })

  it(`creates nodes for each entry`, () => {
    const entryList = buildEntryList({
      currentSyncData,
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
      previousForeignReferenceMapState: undefined,
      deletedEntries: [],
    })

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
        unstable_createNodeManifest,
      })
    })

    const nodeTypeCounts = countCreatedNodeTypesFromMock(createNode.mock)

    expect(Object.keys(nodeTypeCounts)).toHaveLength(15)

    expect(nodeTypeCounts).toEqual(
      expect.objectContaining({
        // 3 Brand Contentful entries
        ContentfulBrand: 6,
        contentfulBrandCompanyDescriptionTextNode: 6,
        contentfulBrandCompanyNameTextNode: 6,
        // 2 Category Contentful entries
        ContentfulCategory: 4,
        contentfulCategoryCategoryDescriptionTextNode: 4,
        contentfulCategoryTitleTextNode: 4,
        ContentfulContentType: contentTypeItems.length,
        // 1 JSON Test Contentful entry
        ContentfulJsonTest: 2,
        contentfulJsonTestJsonStringTestJsonNode: 2,
        contentfulJsonTestJsonTestJsonNode: 2,
        // 4 Product Contentful entries
        ContentfulProduct: 8,
        contentfulProductProductDescriptionTextNode: 8,
        contentfulProductProductNameTextNode: 8,
        // 1 Remark Test Contentful entry
        ContentfulRemarkTest: 2,
        contentfulRemarkTestContentTextNode: 2,
      })
    )

    // Relevant to compare to compare warm and cold situation
    expect(createNode.mock.calls.length).toBe(69) // "cold build entries" count
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
        pluginConfig,
      })
    })
    const nodeTypeCounts = countCreatedNodeTypesFromMock(createNode.mock)

    expect(Object.keys(nodeTypeCounts)).toHaveLength(1)
    expect(nodeTypeCounts).toHaveProperty(`ContentfulAsset`)
  })
})

describe(`Process existing mutated nodes in warm build`, () => {
  it(`creates nodes for each entry`, () => {
    const entryList = buildEntryList({
      currentSyncData,
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
      previousForeignReferenceMapState: undefined,
      deletedEntries: [],
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
        unstable_createNodeManifest,
      })
    })

    const nodeTypeCounts = countCreatedNodeTypesFromMock(createNode.mock)

    expect(Object.keys(nodeTypeCounts)).toHaveLength(15)

    expect(nodeTypeCounts).toEqual(
      expect.objectContaining({
        // 3 Brand Contentful entries
        ContentfulBrand: 6,
        contentfulBrandCompanyDescriptionTextNode: 6,
        contentfulBrandCompanyNameTextNode: 6,
        // 2 Category Contentful entries
        ContentfulCategory: 4,
        contentfulCategoryCategoryDescriptionTextNode: 4,
        contentfulCategoryTitleTextNode: 4,
        ContentfulContentType: contentTypeItems.length,
        // 1 JSON Test Contentful entry
        ContentfulJsonTest: 2,
        contentfulJsonTestJsonStringTestJsonNode: 2,
        contentfulJsonTestJsonTestJsonNode: 2,
        // 4 Product Contentful entries
        ContentfulProduct: 8,
        contentfulProductProductDescriptionTextNode: 8,
        contentfulProductProductNameTextNode: 8,
        // 1 Remark Test Contentful entry
        ContentfulRemarkTest: 2,
        contentfulRemarkTestContentTextNode: 2,
      })
    )

    // Relevant to compare to compare warm and cold situation
    // This number ought to be the same as the cold build
    expect(createNode.mock.calls.length).toBe(69) // "warm build where entry was changed" count
  })
})

describe(`Process contentful data (by id)`, () => {
  it(`builds foreignReferenceMap`, () => {
    const entryList = buildEntryList({
      currentSyncData,
      contentTypeItems,
    })
    const resolvable = buildResolvableSet({
      assets: currentSyncData.assets,
      entryList,
    })
    const foreignReferenceMapState = buildForeignReferenceMap({
      contentTypeItems,
      entryList,
      resolvable,
      defaultLocale,
      space,
      useNameForId: false,
      previousForeignReferenceMapState: undefined,
      deletedEntries: [],
    })

    expect(
      foreignReferenceMapState.backLinks[`24DPGBDeGEaYy8ms4Y8QMQ___Entry`][0]
        .name
    ).toBe(`2pqfxujwe8qsykum0u6w8m___NODE`)

    expect(
      foreignReferenceMapState.backLinks[`2Y8LhXLnYAYqKCGEWG4EKI___Asset`][0]
        .name
    ).toBe(`sfztzbsum8coewygeuyes___NODE`)
  })

  it(`creates nodes for each entry`, () => {
    const entryList = buildEntryList({
      currentSyncData,
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
      useNameForId: false,
      previousForeignReferenceMapState: undefined,
      deletedEntries: [],
    })

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
        unstable_createNodeManifest,
      })
    })
    const nodeTypeCounts = countCreatedNodeTypesFromMock(createNode.mock)

    expect(Object.keys(nodeTypeCounts)).toHaveLength(15)

    expect(nodeTypeCounts).toEqual(
      expect.objectContaining({
        // 3 Brand Contentful entries
        ContentfulSFzTZbSuM8CoEwygeUYes: 6,
        contentfulSFzTZbSuM8CoEwygeUYesCompanyDescriptionTextNode: 6,
        contentfulSFzTZbSuM8CoEwygeUYesCompanyNameTextNode: 6,
        // 2 Category Contentful entries
        Contentful6XwpTaSiiI2Ak2Ww0Oi6Qa: 4,
        contentful6XwpTaSiiI2Ak2Ww0Oi6QaCategoryDescriptionTextNode: 4,
        contentful6XwpTaSiiI2Ak2Ww0Oi6QaTitleTextNode: 4,
        ContentfulContentType: contentTypeItems.length,
        // 1 JSON Test Contentful entry
        ContentfulJsonTest: 2,
        contentfulJsonTestJsonStringTestJsonNode: 2,
        contentfulJsonTestJsonTestJsonNode: 2,
        // 4 Product Contentful entries
        Contentful2PqfXuJwE8QSyKuM0U6W8M: 8,
        contentful2PqfXuJwE8QSyKuM0U6W8MProductDescriptionTextNode: 8,
        contentful2PqfXuJwE8QSyKuM0U6W8MProductNameTextNode: 8,
        // 1 Remark Test Contentful entry
        ContentfulRemarkTest: 2,
        contentfulRemarkTestContentTextNode: 2,
      })
    )
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
