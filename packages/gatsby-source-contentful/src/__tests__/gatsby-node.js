// @ts-check
// This is more an integration test than it is a unit test. We try to mock as little as we can
import _ from "lodash"
import {
  createSchemaCustomization,
  sourceNodes,
  onPreInit,
} from "../gatsby-node"
import { fetchContent, fetchContentTypes } from "../fetch"
import { makeId } from "../normalize"

import startersBlogFixture from "../__fixtures__/starter-blog-data"
import richTextFixture from "../__fixtures__/rich-text-data"
import restrictedContentTypeFixture from "../__fixtures__/restricted-content-type"

jest.mock(`../fetch`)
jest.mock(`gatsby-core-utils`, () => {
  const originalModule = jest.requireActual(`gatsby-core-utils`)
  return {
    ...originalModule,
    createContentDigest: () => `contentDigest`,
  }
})

const defaultPluginOptions = { spaceId: `testSpaceId` }

// @ts-ignore
fetchContentTypes.mockImplementation(() =>
  startersBlogFixture.contentTypeItems()
)

const createMockCache = () => {
  const actualCacheMap = new Map()
  return {
    get: jest.fn(key => _.cloneDeep(actualCacheMap.get(key))),
    set: jest.fn((key, value) => actualCacheMap.set(key, value)),
    directory: __dirname,
    actualMap: actualCacheMap,
  }
}

describe(`gatsby-node`, () => {
  const actions = {
    createTypes: jest.fn(),
    setPluginStatus: jest.fn(),
    createNode: jest.fn(async node => {
      node.internal.owner = `gatsby-source-contentful`
      currentNodeMap.set(node.id, node)
    }),
    deleteNode: jest.fn(node => {
      currentNodeMap.delete(node.id)
    }),
    touchNode: jest.fn(),
  }
  const schema = {
    buildObjectType: jest.fn(() => {
      return {
        config: {
          interfaces: [],
        },
      }
    }),
    buildInterfaceType: jest.fn(),
  }
  const store = {
    getState: jest.fn(() => {
      return { program: { directory: process.cwd() }, status: {} }
    }),
  }
  const cache = createMockCache()
  const getCache = jest.fn(() => cache)
  const reporter = {
    info: jest.fn(),
    verbose: jest.fn(),
    panic: jest.fn(),
    activityTimer: () => {
      return { start: jest.fn(), end: jest.fn() }
    },
  }
  const parentSpan = {}
  const createNodeId = jest.fn(value => value)
  let currentNodeMap
  const getNodes = () => Array.from(currentNodeMap.values())
  const getNode = id => currentNodeMap.get(id)

  const getFieldValue = (value, locale, defaultLocale) =>
    value[locale] ?? value[defaultLocale]

  const simulateGatsbyBuild = async function (
    pluginOptions = defaultPluginOptions
  ) {
    await createSchemaCustomization(
      { schema, actions, reporter, cache, store },
      pluginOptions
    )

    await sourceNodes(
      {
        actions,
        getNode,
        getNodes,
        createNodeId,
        store,
        cache,
        getCache,
        reporter,
        parentSpan,
      },
      pluginOptions
    )
  }

  const testIfContentTypesExists = contentTypeItems => {
    contentTypeItems.forEach(contentType => {
      const contentTypeId = createNodeId(contentType.name)
      expect(getNode(contentTypeId)).toMatchObject({
        name: contentType.name,
        displayField: contentType.displayField,
        description: contentType.description,
      })
    })
  }

  const testIfEntriesExists = (entries, contentTypes, locales) => {
    const defaultLocale = locales[0]

    const nodeMap = new Map()
    const references = new Map()
    locales.forEach(locale => {
      entries.forEach(entry => {
        const currentContentType = contentTypes.find(
          contentType => contentType.sys.id === entry.sys.contentType.sys.id
        )

        const nodeId = createNodeId(
          makeId({
            spaceId: entry.sys.space.sys.id,
            defaultLocale: defaultLocale,
            currentLocale: locale,
            id: entry.sys.id,
            type: entry.sys.type,
          })
        )

        const matchedObject = {}
        Object.keys(entry.fields).forEach(field => {
          const value = getFieldValue(
            entry.fields[field],
            locale,
            defaultLocale
          )

          const fieldDefinition = currentContentType.fields.find(
            cField => cField.id === field
          )
          switch (fieldDefinition.type) {
            case `Link`: {
              const linkId = createNodeId(
                makeId({
                  spaceId: entry.sys.space.sys.id,
                  defaultLocale: defaultLocale,
                  currentLocale: locale,
                  id: value.sys.id,
                  type: value.sys.linkType || value.sys.type,
                })
              )
              matchedObject[`${field}___NODE`] = linkId

              if (
                value.sys.type !== `Asset` &&
                value.sys.linkType !== `Asset`
              ) {
                if (!references.has(linkId)) {
                  references.set(linkId, {})
                }

                const referenceKey = `${currentContentType.name.toLowerCase()}___NODE`
                const reference = references.get(linkId)
                const linkedNode = getNode(linkId)
                reference[referenceKey] =
                  reference[referenceKey] || linkedNode[referenceKey] || []
                reference[referenceKey].push(nodeId)
                references.set(linkId, reference)
              }
              break
            }
            case `Text`: {
              const linkId = createNodeId(`${nodeId}${field}TextNode`)
              matchedObject[`${field}___NODE`] = linkId
              break
            }
            default:
              matchedObject[field] = value
          }
        })

        nodeMap.set(nodeId, matchedObject)
      })

      // update all matchedObjets with our backreferences
      for (const [nodeId, value] of references) {
        const matchedObject = {
          ...nodeMap.get(nodeId),
          ...value,
        }

        nodeMap.set(nodeId, matchedObject)
      }

      // match all entry nodes
      for (const [nodeId, matchedObject] of nodeMap) {
        expect(getNode(nodeId)).toMatchObject(matchedObject)
      }
    })
  }

  const testIfEntriesDeleted = (deletedEntries, locales) => {
    const defaultLocale = locales[0]

    locales.forEach(locale => {
      deletedEntries.forEach(entry => {
        const nodeId = createNodeId(
          makeId({
            spaceId: entry.sys.space.sys.id,
            defaultLocale: defaultLocale,
            currentLocale: locale,
            id: entry.sys.id,
            type: entry.sys.type,
          })
        )

        // check if all deleted nodes are gone
        expect(getNode(nodeId)).toBeUndefined()

        // check if all references got removed references should be removed
        for (const value of currentNodeMap.values()) {
          Object.keys(value).forEach(field => {
            if (field.endsWith(`___NODE`)) {
              expect([].concat(value[field])).not.toContain(nodeId)
            }
          })
        }
      })
    })
  }

  const testIfAssetsExists = (assets, locales) => {
    const defaultLocale = locales[0]
    locales.forEach(locale => {
      assets.forEach(asset => {
        const assetId = createNodeId(
          makeId({
            spaceId: asset.sys.space.sys.id,
            defaultLocale: defaultLocale,
            currentLocale: locale,
            id: asset.sys.id,
            type: asset.sys.type,
          })
        )

        // check if asset exists
        expect(getNode(assetId)).toBeDefined()
      })
    })
  }

  const testIfAssetsExistsAndMatch = (assets, locales) => {
    const defaultLocale = locales[0]
    locales.forEach(locale => {
      assets.forEach(asset => {
        const assetId = createNodeId(
          makeId({
            spaceId: asset.sys.space.sys.id,
            defaultLocale: defaultLocale,
            currentLocale: locale,
            id: asset.sys.id,
            type: asset.sys.type,
          })
        )

        // check if asset exists
        expect(getNode(assetId)).toMatchObject({
          title: getFieldValue(asset.fields.title, locale, defaultLocale),
          description: getFieldValue(
            asset.fields.description,
            locale,
            defaultLocale
          ),
          file: getFieldValue(asset.fields.file, locale, defaultLocale),
        })
      })
    })
  }

  const testIfAssetsDeleted = (deletedAssets, locales) => {
    const defaultLocale = locales[0]

    locales.forEach(locale => {
      deletedAssets.forEach(asset => {
        const assetId = createNodeId(
          makeId({
            spaceId: asset.sys.space.sys.id,
            defaultLocale: defaultLocale,
            currentLocale: locale,
            id: asset.sys.id,
            type: asset.sys.type,
          })
        )

        // check if asset got removed
        expect(getNode(assetId)).toBeUndefined()
      })
    })
  }

  beforeEach(() => {
    // @ts-ignore
    fetchContent.mockClear()
    // @ts-ignore
    fetchContentTypes.mockClear()
    currentNodeMap = new Map()
    actions.createTypes.mockClear()
    actions.setPluginStatus.mockClear()
    actions.createNode.mockClear()
    actions.deleteNode.mockClear()
    actions.touchNode.mockClear()
    store.getState.mockClear()
    cache.actualMap.clear()
    cache.get.mockClear()
    cache.set.mockClear()
    reporter.info.mockClear()
    reporter.panic.mockClear()
  })

  let hasImported = false
  describe(`onPreInit`, () => {
    it(`should pass when gatsby-plugin-image is installed and configured`, async () => {
      const reporter = {
        panic: jest.fn(err => {
          throw err
        }),
      }

      await onPreInit({
        store: {
          getState: () => {
            return {
              flattenedPlugins: [
                {
                  name: `gatsby-plugin-image`,
                },
              ],
            }
          },
        },
        reporter,
      })
    })

    it(`should throw when gatsby-plugin-image is not installed`, async () => {
      const reporter = {
        panic: jest.fn(err => {
          throw err
        }),
      }

      jest.doMock(`gatsby-plugin-image/graphql-utils`, () => {
        if (hasImported) {
          return jest.requireActual(`gatsby-plugin-image/graphql-utils`)
        }

        // only throw once
        hasImported = true
        throw new Error(`not installed`)
      })

      expect.assertions(2)
      try {
        await onPreInit({ store: {}, reporter })
      } catch (err) {
        console.log(err)
        expect(err.id).toBe(`111005`)
        expect(err.context).toMatchInlineSnapshot(`
          Object {
            "sourceMessage": "gatsby-plugin-image is missing from your project.
          Please install \\"gatsby-plugin-image\\".",
          }
        `)
      }
    })
    it(`should throw when gatsby-plugin-image is not configured`, async () => {
      const reporter = {
        panic: jest.fn(err => {
          throw err
        }),
      }

      expect.assertions(2)
      try {
        await onPreInit({
          store: {
            getState: () => {
              return {
                flattenedPlugins: [],
              }
            },
          },
          reporter,
        })
      } catch (err) {
        console.log(err)
        expect(err.id).toBe(`111005`)
        expect(err.context).toMatchInlineSnapshot(`
          Object {
            "sourceMessage": "gatsby-plugin-image is missing from your gatsby-config file.
          Please add \\"gatsby-plugin-image\\" to your plugins array.",
          }
        `)
      }
    })
  })

  it(`should create nodes from initial payload`, async () => {
    // @ts-ignore
    fetchContent.mockImplementationOnce(startersBlogFixture.initialSync)
    const locales = [`en-US`, `nl`]

    await simulateGatsbyBuild()

    testIfContentTypesExists(startersBlogFixture.contentTypeItems())
    testIfEntriesExists(
      startersBlogFixture.initialSync().currentSyncData.entries,
      startersBlogFixture.contentTypeItems(),
      locales
    )
    testIfAssetsExistsAndMatch(
      startersBlogFixture.initialSync().currentSyncData.assets,
      locales
    )

    expect(store.getState).toHaveBeenCalled()

    expect(cache.get.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "contentful-content-types-testSpaceId-master",
        ],
      ]
    `)

    // Stores sync token and raw/unparsed data to the cache
    expect(actions.setPluginStatus).toHaveBeenCalledWith({
      [`contentful-sync-token-testSpaceId-master`]:
        startersBlogFixture.initialSync().currentSyncData.nextSyncToken,
    })

    expect(cache.set.mock.calls.map(v => v[0])).toMatchInlineSnapshot(`
      Array [
        "contentful-content-types-testSpaceId-master",
      ]
    `)
    expect(actions.createNode).toHaveBeenCalledTimes(32)
    expect(actions.deleteNode).toHaveBeenCalledTimes(0)
    expect(actions.touchNode).toHaveBeenCalledTimes(0)
    expect(reporter.info.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "Contentful: 4 new entries",
        ],
        Array [
          "Contentful: 0 updated entries",
        ],
        Array [
          "Contentful: 0 deleted entries",
        ],
        Array [
          "Contentful: 0 cached entries",
        ],
        Array [
          "Contentful: 4 new assets",
        ],
        Array [
          "Contentful: 0 updated assets",
        ],
        Array [
          "Contentful: 0 cached assets",
        ],
        Array [
          "Contentful: 0 deleted assets",
        ],
        Array [
          "Creating 1 Contentful Person nodes",
        ],
        Array [
          "Creating 3 Contentful Blog Post nodes",
        ],
        Array [
          "Creating 4 Contentful asset nodes",
        ],
      ]
    `)
  })

  it(`should add a new blogpost and update linkedNodes`, async () => {
    const locales = [`en-US`, `nl`]

    fetchContent
      // @ts-ignore
      .mockImplementationOnce(startersBlogFixture.initialSync)
      .mockImplementationOnce(startersBlogFixture.createBlogPost)

    const createdBlogEntry =
      startersBlogFixture.createBlogPost().currentSyncData.entries[0]
    const createdBlogEntryIds = locales.map(locale =>
      makeId({
        spaceId: createdBlogEntry.sys.space.sys.id,
        currentLocale: locale,
        defaultLocale: locales[0],
        id: createdBlogEntry.sys.id,
        type: createdBlogEntry.sys.type,
      })
    )

    // initial sync
    await simulateGatsbyBuild()

    // check if blog posts do not exists
    createdBlogEntryIds.forEach(entryId => {
      expect(getNode(entryId)).toBeUndefined()
    })

    // add new blog post
    reporter.info.mockClear()
    await simulateGatsbyBuild()

    testIfContentTypesExists(startersBlogFixture.contentTypeItems())
    testIfEntriesExists(
      startersBlogFixture.createBlogPost().currentSyncData.entries,
      startersBlogFixture.contentTypeItems(),
      locales
    )
    testIfAssetsExistsAndMatch(
      startersBlogFixture.createBlogPost().currentSyncData.assets,
      locales
    )

    createdBlogEntryIds.forEach(blogEntryId => {
      const blogEntry = getNode(blogEntryId)
      expect(getNode(blogEntry[`author___NODE`])).toBeTruthy()
    })

    expect(actions.createNode).toHaveBeenCalledTimes(42)
    expect(actions.deleteNode).toHaveBeenCalledTimes(0)
    expect(actions.touchNode).toHaveBeenCalledTimes(32)
    expect(reporter.info.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "Contentful: 1 new entries",
        ],
        Array [
          "Contentful: 0 updated entries",
        ],
        Array [
          "Contentful: 0 deleted entries",
        ],
        Array [
          "Contentful: 11 cached entries",
        ],
        Array [
          "Contentful: 1 new assets",
        ],
        Array [
          "Contentful: 0 updated assets",
        ],
        Array [
          "Contentful: 4 cached assets",
        ],
        Array [
          "Contentful: 0 deleted assets",
        ],
        Array [
          "Creating 1 Contentful Blog Post nodes",
        ],
        Array [
          "Creating 1 Contentful asset nodes",
        ],
      ]
    `)
  })

  it(`should update a blogpost`, async () => {
    const locales = [`en-US`, `nl`]
    fetchContent
      // @ts-ignore
      .mockImplementationOnce(startersBlogFixture.initialSync)
      .mockImplementationOnce(startersBlogFixture.createBlogPost)
      .mockImplementationOnce(startersBlogFixture.updateBlogPost)

    const updatedBlogEntry =
      startersBlogFixture.updateBlogPost().currentSyncData.entries[0]
    const updatedBlogEntryIds = locales.map(locale =>
      makeId({
        spaceId: updatedBlogEntry.sys.space.sys.id,
        currentLocale: locale,
        defaultLocale: locales[0],
        id: updatedBlogEntry.sys.id,
        type: updatedBlogEntry.sys.type,
      })
    )

    // initial sync
    await simulateGatsbyBuild()

    // create blog post
    await simulateGatsbyBuild()

    updatedBlogEntryIds.forEach(blogEntryId => {
      expect(getNode(blogEntryId).title).toBe(`Integration tests`)
    })

    // updated blog post
    reporter.info.mockClear()
    await simulateGatsbyBuild()

    testIfContentTypesExists(startersBlogFixture.contentTypeItems())
    testIfEntriesExists(
      startersBlogFixture.updateBlogPost().currentSyncData.entries,
      startersBlogFixture.contentTypeItems(),
      locales
    )
    testIfAssetsExistsAndMatch(
      startersBlogFixture.updateBlogPost().currentSyncData.assets,
      locales
    )

    updatedBlogEntryIds.forEach(blogEntryId => {
      const blogEntry = getNode(blogEntryId)
      expect(blogEntry.title).toBe(`Hello world 1234`)
      expect(getNode(blogEntry[`author___NODE`])).toBeTruthy()
    })

    expect(actions.createNode).toHaveBeenCalledTimes(50)
    expect(actions.deleteNode).toHaveBeenCalledTimes(0)
    expect(actions.touchNode).toHaveBeenCalledTimes(72)
    expect(reporter.info.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "Contentful: 0 new entries",
        ],
        Array [
          "Contentful: 1 updated entries",
        ],
        Array [
          "Contentful: 0 deleted entries",
        ],
        Array [
          "Contentful: 14 cached entries",
        ],
        Array [
          "Contentful: 0 new assets",
        ],
        Array [
          "Contentful: 0 updated assets",
        ],
        Array [
          "Contentful: 5 cached assets",
        ],
        Array [
          "Contentful: 0 deleted assets",
        ],
        Array [
          "Creating 1 Contentful Blog Post nodes",
        ],
      ]
    `)
  })

  it(`should remove a blogpost and update linkedNodes`, async () => {
    const locales = [`en-US`, `nl`]
    fetchContent
      // @ts-ignore
      .mockImplementationOnce(startersBlogFixture.initialSync)
      .mockImplementationOnce(startersBlogFixture.createBlogPost)
      .mockImplementationOnce(startersBlogFixture.removeBlogPost)

    const removedBlogEntry =
      startersBlogFixture.removeBlogPost().currentSyncData.deletedEntries[0]
    const normalizedType = removedBlogEntry.sys.type.startsWith(`Deleted`)
      ? removedBlogEntry.sys.type.substring(`Deleted`.length)
      : removedBlogEntry.sys.type
    const removedBlogEntryIds = locales.map(locale =>
      makeId({
        spaceId: removedBlogEntry.sys.space.sys.id,
        currentLocale: locale,
        defaultLocale: locales[0],
        id: removedBlogEntry.sys.id,
        type: normalizedType,
      })
    )

    // initial sync
    await simulateGatsbyBuild()

    // create blog post
    await simulateGatsbyBuild()

    const authorIds = []
    // check if blog post exists
    removedBlogEntryIds.forEach(entryId => {
      const blogEntry = getNode(entryId)
      authorIds.push(blogEntry[`author___NODE`])
      expect(blogEntry).not.toBeUndefined()
    })

    // remove blog post
    reporter.info.mockClear()
    await simulateGatsbyBuild()

    const { deletedEntries } =
      startersBlogFixture.removeBlogPost().currentSyncData

    testIfContentTypesExists(startersBlogFixture.contentTypeItems())
    testIfEntriesDeleted(deletedEntries, locales)

    const deletedEntryIds = deletedEntries.map(entry =>
      createNodeId(
        makeId({
          spaceId: entry.sys.space.sys.id,
          currentLocale: entry.sys.locale,
          defaultLocale: locales[0],
          id: entry.sys.id,
          type: entry.sys.type,
        })
      )
    )

    // check if references are gone
    authorIds.forEach(authorId => {
      expect(getNode(authorId)[`blog post___NODE`]).toEqual(
        expect.not.arrayContaining(deletedEntryIds)
      )
    })

    expect(actions.createNode).toHaveBeenCalledTimes(44)
    expect(actions.deleteNode).toHaveBeenCalledTimes(2)
    expect(actions.touchNode).toHaveBeenCalledTimes(74)
    expect(reporter.info.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "Contentful: 0 new entries",
        ],
        Array [
          "Contentful: 0 updated entries",
        ],
        Array [
          "Contentful: 1 deleted entries",
        ],
        Array [
          "Contentful: 14 cached entries",
        ],
        Array [
          "Contentful: 0 new assets",
        ],
        Array [
          "Contentful: 0 updated assets",
        ],
        Array [
          "Contentful: 5 cached assets",
        ],
        Array [
          "Contentful: 0 deleted assets",
        ],
      ]
    `)
  })

  it(`should remove an asset`, async () => {
    const locales = [`en-US`, `nl`]

    fetchContent
      // @ts-ignore
      .mockImplementationOnce(startersBlogFixture.initialSync)
      .mockImplementationOnce(startersBlogFixture.createBlogPost)
      .mockImplementationOnce(startersBlogFixture.removeAsset)

    const removedAssetEntry =
      startersBlogFixture.createBlogPost().currentSyncData.entries[0]
    const removedAssetEntryIds = locales.map(locale =>
      makeId({
        spaceId: removedAssetEntry.sys.space.sys.id,
        currentLocale: locale,
        defaultLocale: locales[0],
        id: removedAssetEntry.sys.id,
        type: removedAssetEntry.sys.type,
      })
    )

    // initial sync
    await simulateGatsbyBuild()

    // create blog post
    await simulateGatsbyBuild()

    // check if blog post exists
    removedAssetEntryIds.forEach(assetId => {
      expect(getNode(assetId)).not.toBeUndefined()
    })

    // check if assets exists
    testIfAssetsExists(
      startersBlogFixture.removeAsset().currentSyncData.deletedAssets,
      locales
    )

    // remove asset
    reporter.info.mockClear()
    await simulateGatsbyBuild()

    testIfContentTypesExists(startersBlogFixture.contentTypeItems())
    testIfEntriesExists(
      startersBlogFixture.removeAsset().currentSyncData.entries,
      startersBlogFixture.removeAsset().contentTypeItems,
      locales
    )
    testIfAssetsDeleted(
      startersBlogFixture.removeAsset().currentSyncData.deletedAssets,
      locales
    )

    expect(actions.createNode).toHaveBeenCalledTimes(44)
    expect(actions.deleteNode).toHaveBeenCalledTimes(2)
    expect(actions.touchNode).toHaveBeenCalledTimes(74)
    expect(reporter.info.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "Contentful: 0 new entries",
        ],
        Array [
          "Contentful: 0 updated entries",
        ],
        Array [
          "Contentful: 0 deleted entries",
        ],
        Array [
          "Contentful: 14 cached entries",
        ],
        Array [
          "Contentful: 0 new assets",
        ],
        Array [
          "Contentful: 0 updated assets",
        ],
        Array [
          "Contentful: 5 cached assets",
        ],
        Array [
          "Contentful: 1 deleted assets",
        ],
      ]
    `)
  })

  it(`stores rich text as raw with references attached`, async () => {
    // @ts-ignore
    fetchContent.mockImplementationOnce(richTextFixture.initialSync)
    // @ts-ignore
    fetchContentTypes.mockImplementationOnce(richTextFixture.contentTypeItems)

    // initial sync
    await simulateGatsbyBuild()

    const initNodes = getNodes()

    const homeNodes = initNodes.filter(
      ({ contentful_id: id }) => id === `6KpLS2NZyB3KAvDzWf4Ukh`
    )
    expect(homeNodes).toHaveLength(2)
    homeNodes.forEach(homeNode => {
      expect(homeNode.content.references___NODE).toStrictEqual([
        ...new Set(homeNode.content.references___NODE),
      ])
      expect(homeNode.content.references___NODE).toMatchSnapshot()
    })
  })

  it(`panics when localeFilter reduces locale list to 0`, async () => {
    // @ts-ignore
    fetchContent.mockImplementationOnce(startersBlogFixture.initialSync)
    const locales = [`en-US`, `nl`]

    await simulateGatsbyBuild({
      ...defaultPluginOptions,
      localeFilter: () => false,
    })

    expect(reporter.panic).toBeCalledWith(
      expect.objectContaining({
        context: {
          sourceMessage: `Please check if your localeFilter is configured properly. Locales '${locales.join(
            `,`
          )}' were found but were filtered down to none.`,
        },
      })
    )
  })

  it(`panics when response contains restricted content types`, async () => {
    // @ts-ignore
    fetchContent.mockImplementationOnce(
      restrictedContentTypeFixture.initialSync
    )
    // @ts-ignore
    fetchContentTypes.mockImplementationOnce(
      restrictedContentTypeFixture.contentTypeItems
    )

    await simulateGatsbyBuild()

    expect(reporter.panic).toBeCalledWith(
      expect.objectContaining({
        context: {
          sourceMessage: `Restricted ContentType name found. The name "reference" is not allowed.`,
        },
      })
    )
  })

  it(`panics when response contains content type Tag while enableTags is true`, async () => {
    // @ts-ignore
    fetchContent.mockImplementationOnce(
      restrictedContentTypeFixture.initialSync
    )
    const contentTypesWithTag = () => {
      const manipulatedContentTypeItems =
        restrictedContentTypeFixture.contentTypeItems()
      manipulatedContentTypeItems[0].name = `Tag`
      return manipulatedContentTypeItems
    }
    // @ts-ignore
    fetchContentTypes.mockImplementationOnce(contentTypesWithTag)

    await simulateGatsbyBuild({
      spaceId: `mocked`,
      enableTags: true,
      useNameForId: true,
    })

    expect(reporter.panic).toBeCalledWith(
      expect.objectContaining({
        context: {
          sourceMessage: `Restricted ContentType name found. The name "tag" is not allowed.`,
        },
      })
    )
  })
})
