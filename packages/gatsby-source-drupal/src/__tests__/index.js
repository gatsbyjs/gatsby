import got from "got"

const baseUrl = `http://fixture`
const proxyUrl = `http://fixture-proxy`

jest.mock(`got`, () =>
  jest.fn(path => {
    if (path.includes(proxyUrl)) {
      path = path.replace(proxyUrl, baseUrl)
    }

    let last = ``
    if (path.includes(`i18n-test`)) {
      last = `i18n-test-`
    }
    last += path.split(`/`).pop()
    try {
      return { body: require(`./fixtures/${last}.json`.replace(`?`, `___`)) }
    } catch (e) {
      console.log(`Error`, e)
      return null
    }
  })
)

const probeImageSize = require(`probe-image-size`)

jest.mock(`probe-image-size`, () =>
  jest.fn(() => {
    return {
      width: 100,
      height: 100,
    }
  })
)

jest.mock(`gatsby-source-filesystem`, () => {
  return {
    createRemoteFileNode: jest.fn(),
  }
})

let cacheStore
function makeCache() {
  cacheStore = new Map()
  return {
    get: async id =>
      new Promise(resolve =>
        process.nextTick(() => resolve(cacheStore.get(id)))
      ),
    set: async (key, value) =>
      new Promise(resolve =>
        process.nextTick(() => resolve(cacheStore.set(key, value)))
      ),
    del: async key => cacheStore.delete(key),
    cacheStore,
  }
}

const normalize = require(`../normalize`)
const downloadFileSpy = jest.spyOn(normalize, `downloadFile`)

const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

const { sourceNodes, onPreBootstrap } = require(`../gatsby-node`)
const { handleWebhookUpdate } = require(`../utils`)

describe(`gatsby-source-drupal`, () => {
  let nodes = {}
  const createNodeId = id => `generated-id-${id}`
  const createContentDigest = jest.fn().mockReturnValue(`contentDigest`)
  const { objectContaining } = expect
  const actions = {
    createNode: jest.fn(node => (nodes[node.id] = node)),
    deleteNode: jest.fn(node => delete nodes[node.id]),
    setPluginStatus: jest.fn(),
    touchNode: jest.fn(),
  }
  const getNodes = jest.fn(() => {
    return {
      forEach: jest.fn(() => nodes),
    }
  })

  const activity = {
    start: jest.fn(),
    end: jest.fn(),
  }
  const reporter = {
    info: jest.fn(),
    warn: jest.fn(),
    verbose: jest.fn(),
    activityTimer: jest.fn(() => activity),
    log: jest.fn(),
    error: console.error,
    panic: input => {
      throw new Error(input)
    },
  }
  const store = {
    getState: jest.fn(() => {
      return {
        status: {
          plugins: [],
        },
      }
    }),
  }

  const args = {
    createNodeId,
    createContentDigest,
    actions,
    reporter,
    store,
    getNode: id => nodes[id],
    getNodes,
    cache: makeCache(),
  }

  beforeAll(async () => {
    await sourceNodes(args, { baseUrl })
  })

  it(`Generates nodes`, () => {
    expect(Object.keys(nodes).length).not.toEqual(0)
    expect(nodes[createNodeId(`und.file-1`)]).toBeDefined()
    expect(nodes[createNodeId(`und.file-2`)]).toBeDefined()
    expect(nodes[createNodeId(`und.tag-1`)]).toBeDefined()
    expect(nodes[createNodeId(`und.tag-2`)]).toBeDefined()
    expect(nodes[createNodeId(`und.article-1`)]).toBeDefined()
    expect(nodes[createNodeId(`und.article-2`)]).toBeDefined()
    expect(nodes[createNodeId(`und.article-3`)]).toBeDefined()
  })

  it(`Nodes contain contentDigest`, () => {
    expect(nodes[createNodeId(`und.file-1`)]).toEqual(
      objectContaining({
        internal: objectContaining({ contentDigest: `contentDigest` }),
      })
    )
    expect(nodes[createNodeId(`und.article-2`)]).toEqual(
      objectContaining({
        internal: objectContaining({ contentDigest: `contentDigest` }),
      })
    )
    expect(nodes[createNodeId(`und.tag-1`)]).toEqual(
      objectContaining({
        internal: objectContaining({ contentDigest: `contentDigest` }),
      })
    )
  })

  it(`Nodes contain attributes data`, () => {
    expect(nodes[createNodeId(`und.file-1`)].filename).toEqual(`main-image.png`)
    expect(nodes[createNodeId(`und.article-2`)].title).toEqual(`Article #2`)
    expect(nodes[createNodeId(`und.tag-1`)].langcode).toEqual(`en`)
  })

  it(`Preserves attributes.id`, () => {
    expect(nodes[createNodeId(`und.article-2`)]._attributes_id).toEqual(22)
  })

  it(`Handles 1:1 relationship`, () => {
    expect(
      nodes[createNodeId(`und.article-1`)].relationships.field_main_image___NODE
    ).not.toBeDefined()
    expect(
      nodes[createNodeId(`und.article-2`)].relationships.field_main_image___NODE
    ).toEqual(createNodeId(`und.file-1`))
    expect(
      nodes[createNodeId(`und.article-3`)].relationships.field_main_image___NODE
    ).toEqual(createNodeId(`und.file-1`))

    expect(nodes[createNodeId(`und.paragraph-image-1`)].relationships).toEqual({
      field_gallery___NODE: createNodeId(`und.article-2`),
    })
  })

  it(`Handles 1:N relationship`, () => {
    expect(
      nodes[createNodeId(`und.article-1`)].relationships.field_tags___NODE
    ).toEqual(
      expect.arrayContaining([
        createNodeId(`und.tag-1`),
        createNodeId(`und.tag-2`),
      ])
    )
    expect(
      nodes[createNodeId(`und.article-2`)].relationships.field_tags___NODE
    ).not.toBeDefined()
    expect(
      nodes[createNodeId(`und.article-3`)].relationships.field_tags___NODE
    ).toEqual(expect.arrayContaining([createNodeId(`und.tag-1`)]))
  })

  it(`Creates back references`, () => {
    expect(
      nodes[createNodeId(`und.file-1`)].relationships[`node__article___NODE`]
    ).toEqual(
      expect.arrayContaining([
        createNodeId(`und.article-2`),
        createNodeId(`und.article-3`),
      ])
    )
    expect(
      nodes[createNodeId(`und.tag-1`)].relationships[`node__article___NODE`]
    ).toEqual(
      expect.arrayContaining([
        createNodeId(`und.article-1`),
        createNodeId(`und.article-3`),
      ])
    )
    expect(
      nodes[createNodeId(`und.tag-2`)].relationships[`node__article___NODE`]
    ).toEqual(expect.arrayContaining([createNodeId(`und.article-1`)]))
  })

  it(`Download files without Basic Auth`, () => {
    const urls = [
      `/sites/default/files/main-image.png`,
      `/sites/default/files/secondary-image.png`,
      `https://files.s3.eu-central-1.amazonaws.com/2020-05/third-image.png`,
      `/sites/default/files/forth-image.png`,
    ].map(fileUrl => new URL(fileUrl, baseUrl).href)

    urls.forEach(url => {
      expect(createRemoteFileNode).toBeCalledWith(
        expect.objectContaining({
          url,
          auth: {},
        })
      )
    })
  })

  it(`Download files with Basic Auth`, async () => {
    const basicAuth = {
      username: `user`,
      password: `password`,
    }
    await sourceNodes(args, { baseUrl, basicAuth })
    const urls = [
      `http://fixture/sites/default/files/main-image.png`,
      `http://fixture/sites/default/files/secondary-image.png`,
      `https://files.s3.eu-central-1.amazonaws.com/2020-05/third-image.png`,
      `/sites/default/files/forth-image.png`,
    ].map(fileUrl => new URL(fileUrl, baseUrl).href)
    // first call without basicAuth (no fileSystem defined)
    // (the first call is actually the 5th because sourceNodes was ran at first with no basicAuth)
    expect(createRemoteFileNode).toHaveBeenNthCalledWith(
      6,
      expect.objectContaining({
        url: urls[0],
        auth: {},
      })
    )
    // 2nd call with basicAuth (public: fileSystem defined)
    expect(createRemoteFileNode).toHaveBeenNthCalledWith(
      7,
      expect.objectContaining({
        url: urls[1],
        auth: {
          htaccess_pass: `password`,
          htaccess_user: `user`,
        },
      })
    )
    // 3rd call without basicAuth (s3: fileSystem defined)
    expect(createRemoteFileNode).toHaveBeenNthCalledWith(
      8,
      expect.objectContaining({
        url: urls[2],
        auth: {},
      })
    )
    // 4th call with basicAuth (private: fileSystem defined)
    expect(createRemoteFileNode).toHaveBeenNthCalledWith(
      9,
      expect.objectContaining({
        url: urls[3],
        auth: {
          htaccess_pass: `password`,
          htaccess_user: `user`,
        },
      })
    )
  })

  it(`Skips File Downloads on initial build`, async () => {
    const skipFileDownloads = true
    expect(createRemoteFileNode).toBeCalledTimes(10)
    await sourceNodes(args, { baseUrl, skipFileDownloads })
    expect(createRemoteFileNode).toBeCalledTimes(10)
  })

  it(`Skips File Downloads on webhook update`, async () => {
    const skipFileDownloads = true
    expect(createRemoteFileNode).toBeCalledTimes(10)
    const nodeToUpdate = require(`./fixtures/webhook-file-update.json`).data

    await handleWebhookUpdate(
      {
        nodeToUpdate,
        ...args,
      },
      {
        baseUrl,
        skipFileDownloads,
      }
    )

    expect(createRemoteFileNode).toBeCalledTimes(10)
  })

  describe(`Update webhook`, () => {
    describe(`Update content`, () => {
      describe(`Before update`, () => {
        it(`Attributes`, () => {
          expect(nodes[createNodeId(`und.article-3`)].title).toBe(`Article #3`)
        })
        it(`Relationships`, () => {
          expect(nodes[createNodeId(`und.article-3`)].relationships).toEqual({
            field_main_image___NODE: createNodeId(`und.file-1`),
            field_tags___NODE: [createNodeId(`und.tag-1`)],
          })
        })
        it(`Back references`, () => {
          expect(
            nodes[createNodeId(`und.file-1`)].relationships[
              `node__article___NODE`
            ]
          ).toContain(createNodeId(`und.article-3`))
          expect(
            nodes[createNodeId(`und.tag-1`)].relationships[
              `node__article___NODE`
            ]
          ).toContain(createNodeId(`und.article-3`))
          expect(
            nodes[createNodeId(`und.tag-2`)].relationships[
              `node__article___NODE`
            ]
          ).not.toContain(createNodeId(`und.article-3`))
        })
      })

      describe(`After update`, () => {
        beforeAll(async () => {
          const nodeToUpdate = require(`./fixtures/webhook-update.json`).data

          await handleWebhookUpdate({
            nodeToUpdate,
            ...args,
          })
        })

        it(`Attributes`, () => {
          expect(nodes[createNodeId(`und.article-3`)].title).toBe(
            `Article #3 - Updated`
          )
        })

        it(`Relationships`, () => {
          // removed `field_main_image`, changed `field_tags`
          expect(nodes[createNodeId(`und.article-3`)].relationships).toEqual({
            field_tags___NODE: [createNodeId(`und.tag-2`)],
          })
        })

        it(`Back references`, () => {
          // removed `field_main_image`, `file-1` no longer has back reference to `article-3`
          expect(
            nodes[createNodeId(`und.file-1`)].relationships[
              `node__article___NODE`
            ]
          ).not.toContain(createNodeId(`und.article-3`))
          // changed `field_tags`, `tag-1` no longer has back reference to `article-3`
          expect(
            nodes[createNodeId(`und.tag-1`)].relationships[
              `node__article___NODE`
            ]
          ).not.toContain(createNodeId(`und.article-3`))
          // changed `field_tags`, `tag-2` now has back reference to `article-3`
          expect(
            nodes[createNodeId(`und.tag-2`)].relationships[
              `node__article___NODE`
            ]
          ).toContain(createNodeId(`und.article-3`))
        })
      })
    })
    describe(`multiple entities in webhook body`, () => {
      let resp
      beforeAll(async () => {
        const webhookBody = require(`./fixtures/webhook-body-multiple-nodes.json`)
        await sourceNodes(
          {
            ...args,
            webhookBody,
          },
          { baseUrl }
        )
      })

      it(`Relationships`, async () => {
        expect(
          nodes[createNodeId(`und.article-10`)].relationships.field_tags___NODE
            .length
        ).toBe(1)
      })
    })

    describe(`Insert content`, () => {
      it(`Node doesn't exist before webhook`, () => {
        expect(nodes[createNodeId(`und.article-4`)]).not.toBeDefined()
        expect(
          nodes[createNodeId(`und.tag-1`)].relationships[`node__article___NODE`]
        ).not.toContain(createNodeId(`und.article-4`))
      })

      describe(`After insert`, () => {
        beforeAll(async () => {
          const nodeToUpdate = require(`./fixtures/webhook-insert.json`).data

          await handleWebhookUpdate({
            nodeToUpdate,
            ...args,
          })
        })
        it(`Creates node`, () => {
          expect(nodes[createNodeId(`und.article-4`)]).toBeDefined()
          expect(nodes[createNodeId(`und.article-4`)].title).toBe(`Article #4`)
        })

        it(`Adds back references to referenced nodes`, () => {
          expect(
            nodes[createNodeId(`und.tag-1`)].relationships[
              `node__article___NODE`
            ]
          ).toContain(createNodeId(`und.article-4`))
        })
      })
    })
  })

  it(`Control disallowed link types`, async () => {
    // Reset nodes and test new disallowed link type.
    Object.keys(nodes).forEach(key => delete nodes[key])
    const disallowedLinkTypes = [`self`, `describedby`, `taxonomy_term--tags`]
    await sourceNodes(args, { baseUrl, disallowedLinkTypes })
    expect(Object.keys(nodes).length).not.toEqual(0)
    expect(nodes[createNodeId(`und.file-1`)]).toBeDefined()
    expect(nodes[createNodeId(`und.file-2`)]).toBeDefined()
    expect(nodes[createNodeId(`und.tag-1`)]).toBeUndefined()
    expect(nodes[createNodeId(`und.tag-2`)]).toBeUndefined()
    expect(nodes[createNodeId(`und.article-1`)]).toBeDefined()
    expect(nodes[createNodeId(`und.article-2`)]).toBeDefined()
    expect(nodes[createNodeId(`und.article-3`)]).toBeDefined()
  })

  it(`Can use the proxyUrl plugin option to use a different API url for sourcing`, async () => {
    got.mockClear()
    nodes = {}
    await sourceNodes(args, { baseUrl, proxyUrl })

    let callSkipCount = 0
    for (const [index, call] of got.mock.calls.entries()) {
      if (call[0] === `http://fixture/jsonapi`) {
        callSkipCount++
        continue
      }

      expect(got).toHaveBeenNthCalledWith(
        index + 1,
        expect.stringContaining(proxyUrl),
        expect.anything()
      )
    }

    expect(callSkipCount).toBe(1)
    expect(got).toBeCalledTimes(8)

    expect(Object.keys(nodes).length).not.toEqual(0)
    expect(nodes[createNodeId(`und.file-1`)]).toBeDefined()
    expect(nodes[createNodeId(`und.file-2`)]).toBeDefined()
    expect(nodes[createNodeId(`und.tag-1`)]).toBeDefined()
    expect(nodes[createNodeId(`und.tag-2`)]).toBeDefined()
    expect(nodes[createNodeId(`und.article-1`)]).toBeDefined()
    expect(nodes[createNodeId(`und.article-2`)]).toBeDefined()
    expect(nodes[createNodeId(`und.article-3`)]).toBeDefined()
  })

  it(`Verify JSON:API includes relationships`, async () => {
    // Reset nodes and test includes relationships.
    Object.keys(nodes).forEach(key => delete nodes[key])
    const disallowedLinkTypes = [`self`, `describedby`, `taxonomy_term--tags`]
    const entityReferenceRevisions = [`paragraph`]
    const filters = {
      "node--article": `include=field_tags`,
    }
    const apiBase = `jsonapi-includes`
    await sourceNodes(args, {
      baseUrl,
      apiBase,
      disallowedLinkTypes,
      filters,
      entityReferenceRevisions,
    })
    expect(Object.keys(nodes).length).not.toEqual(0)
    expect(nodes[createNodeId(`und.tag-1`)]).toBeUndefined()
    expect(nodes[createNodeId(`und.tag-2`)]).toBeUndefined()
    expect(nodes[createNodeId(`und.tag-3`)]).toBeDefined()
    const paragraphForwardRevisionId = createNodeId(
      `und.08d07c95-26ab-46b8-a56d-0a55567b2e31.4`
    )
    const paragraphDraft = nodes[paragraphForwardRevisionId]
    expect(paragraphDraft).toBeDefined()
    expect(
      nodes[createNodeId(`und.08d07c95-26ab-46b8-a56d-0a55567b2e31.3`)]
    ).toBeDefined()
    expect(nodes[createNodeId(`und.tag-3`)]).toBeDefined()

    const article = nodes[createNodeId(`und.article-5`)]
    expect(article).toBeDefined()
    const paragraphRelationships = article.relationships[`content___NODE`]
    expect(paragraphRelationships).toContain(paragraphForwardRevisionId)

    expect(paragraphDraft.body.value).toEqual(
      `Aenean porta turpis quis vulputate blandit`
    )
  })

  describe(`supports JSON:API extras meta.count to parallelize fetches`, () => {
    it(`for non-translated content`, async () => {
      // Reset nodes and test includes relationships.
      Object.keys(nodes).forEach(key => delete nodes[key])
      const apiBase = `jsonapi-meta.count`
      await sourceNodes(args, {
        baseUrl,
        apiBase,
      })
      expect(Object.keys(nodes).length).toEqual(3)
    })

    it(`for translated content`, async () => {
      // Reset nodes and test includes relationships.
      Object.keys(nodes).forEach(key => delete nodes[key])
      const apiBase = `jsonapi-meta.count-i18n`
      const options = {
        baseUrl,
        apiBase,
        languageConfig: {
          defaultLanguage: `en_US`,
          enabledLanguages: [
            `en_US`,
            {
              langCode: `en-gb`,
              as: `i18n-test`,
            },
          ],
          translatableEntities: [`node--article`],
          nonTranslatableEntities: [],
        },
      }
      // Call onPreBootstrap to set options
      await onPreBootstrap(args, options)
      await sourceNodes(args, options)
      expect(Object.keys(nodes).length).toEqual(4)
      expect(
        Object.values(nodes).filter(n => n.langcode === `i18n-test`).length
      ).toEqual(2)
    })
  })

  describe(`Paragraph fields`, () => {
    it(`creates the initial paragraph entity correctly`, async () => {
      // Reset nodes.
      Object.keys(nodes).forEach(key => delete nodes[key])
      const nodesToUpdate = require(`./fixtures/paragraph-v1.json`)
      for (const nodeToUpdate of nodesToUpdate) {
        await handleWebhookUpdate(
          {
            nodeToUpdate: nodeToUpdate.data,
            ...args,
          },
          { baseUrl: `https://example.com` }
        )
      }
      expect(
        nodes[`generated-id-en_US.e7861064-0009-4458-bf6e-0284d34bb00d`]
          .field_image.alt
      ).toEqual(`alt text`)
    })
    it(`updates the referenced entities correctly`, async () => {
      // Reset nodes.
      Object.keys(nodes).forEach(key => delete nodes[key])
      const nodesToUpdate = require(`./fixtures/paragraph-v2.json`)
      for (const nodeToUpdate of nodesToUpdate) {
        await handleWebhookUpdate(
          {
            nodeToUpdate: nodeToUpdate.data,
            ...args,
          },
          { baseUrl: `https://example.com` }
        )
      }

      expect(
        nodes[`generated-id-en_US.e7861064-0009-4458-bf6e-0284d34bb00d`]
          .field_image.alt
      ).toEqual(`alt text v2`)
    })
  })

  describe(`Image CDN`, () => {
    afterEach(() => {
      probeImageSize.mockClear()
    })

    it(`should generate required Image CDN node data`, async () => {
      // Reset nodes and test includes relationships.
      Object.keys(nodes).forEach(key => delete nodes[key])

      const options = {
        baseUrl,
        skipFileDownloads: true,
      }

      // Call onPreBootstrap to set options
      await onPreBootstrap(args, options)
      await sourceNodes(args, options)

      const fileNode = nodes[createNodeId(`und.file-1`)]
      expect(fileNode).toBeDefined()
      expect(fileNode.url).toEqual(
        `http://fixture/sites/default/files/main-image.png`
      )
      expect(fileNode.mimeType).toEqual(`image/png`)
      expect(fileNode.width).toEqual(100)
      expect(fileNode.height).toEqual(100)
      expect(probeImageSize).toHaveBeenCalled()
    })

    it(`should generate Image CDN node data when mimetype is on "mimetype" field`, async () => {
      // Reset nodes and test includes relationships.
      Object.keys(nodes).forEach(key => delete nodes[key])

      const options = {
        baseUrl,
        skipFileDownloads: true,
      }

      // Call onPreBootstrap to set options
      await onPreBootstrap(args, options)
      await sourceNodes(args, options)

      const fileNode = nodes[createNodeId(`und.file-5`)]
      expect(fileNode).toBeDefined()
      expect(fileNode.url).toEqual(
        `http://fixture/sites/default/files/main-image5.png`
      )
      expect(fileNode.mimeType).toEqual(`image/png`)
      expect(fileNode.width).toEqual(100)
      expect(fileNode.height).toEqual(100)
      expect(probeImageSize).toHaveBeenCalled()
    })

    it(`should not generate required Image CDN node data when imageCDN option is set to false`, async () => {
      // Reset nodes and test includes relationships.
      Object.keys(nodes).forEach(key => delete nodes[key])

      const options = {
        baseUrl,
        skipFileDownloads: true,
        imageCDN: false,
      }

      // Call onPreBootstrap to set options
      await onPreBootstrap(args, options)
      await sourceNodes(args, options)

      const fileNode = nodes[createNodeId(`und.file-1`)]

      // imageCDN: true fetches the width/height
      expect(fileNode.width).not.toBeDefined()
      expect(fileNode.height).not.toBeDefined()
      expect(probeImageSize).not.toHaveBeenCalled()
    })
  })

  describe(`Fastbuilds sync`, () => {
    describe(`Before sync with expired timestamp`, () => {
      beforeAll(async () => {
        // Reset nodes and test Fastbuilds sync.
        Object.keys(nodes).forEach(key => delete nodes[key])

        const fastBuilds = true
        const options = { baseUrl, fastBuilds }
        await onPreBootstrap(args, options)
        await sourceNodes(args, options)
      })

      it(`Attributes`, () => {
        expect(nodes[createNodeId(`und.article-3`)].title).toBe(`Article #3`)
      })

      it(`Relationships`, () => {
        expect(nodes[createNodeId(`und.article-3`)].relationships).toEqual({
          field_main_image___NODE: createNodeId(`und.file-1`),
          field_tags___NODE: [createNodeId(`und.tag-1`)],
        })
        expect(
          nodes[createNodeId(`und.article-2`)].relationships
            .field_secondary_image___NODE
        ).toEqual([createNodeId(`und.file-4`)])
      })

      it(`Back references`, () => {
        expect(
          nodes[createNodeId(`und.file-1`)].relationships[
            `node__article___NODE`
          ]
        ).toContain(createNodeId(`und.article-3`))
        expect(
          nodes[createNodeId(`und.tag-1`)].relationships[`node__article___NODE`]
        ).toContain(createNodeId(`und.article-3`))
        expect(
          nodes[createNodeId(`und.tag-2`)].relationships[`node__article___NODE`]
        ).not.toContain(createNodeId(`und.article-3`))
      })
    })

    describe(`After sync with valid timestamp`, () => {
      beforeAll(async () => {
        const fastBuilds = true

        // Mock the lastFetched timestamp to a value.
        args.store.getState.mockReturnValue({
          status: {
            plugins: {
              "gatsby-source-drupal": {
                lastFetched: 1593545806,
              },
            },
          },
        })
        await sourceNodes(args, { baseUrl, fastBuilds })
      })

      it(`Attributes`, () => {
        expect(nodes[createNodeId(`und.article-3`)].title).toBe(
          `Article #3 - Synced`
        )
      })

      it(`Relationships`, () => {
        // removed `field_main_image`, changed `field_tags`
        expect(nodes[createNodeId(`und.article-3`)].relationships).toEqual({
          field_tags___NODE: [createNodeId(`und.tag-2`)],
        })
        expect(
          nodes[createNodeId(`und.paragraph-image-1`)].relationships
        ).toEqual({
          field_gallery___NODE: createNodeId(`und.article-1`),
        })
        expect(
          nodes[createNodeId(`und.article-2`)].relationships
            .field_secondary_image___NODE
        ).toBe(undefined)
        expect(
          nodes[createNodeId(`und.article-2`)].relationships
            .field_secondary_multiple_image___NODE.length
        ).toBe(1)
        expect(
          nodes[createNodeId(`und.article-2`)].relationships
            .field_tertiary_image___NODE_image___NODE
        ).toBe(undefined)
        expect(
          nodes[createNodeId(`und.article-10`)].relationships.field_tags___NODE
            .length
        ).toBe(1)
      })

      it(`Back references`, () => {
        // removed `field_main_image`, `file-1` no longer has back reference to `article-3`
        expect(
          nodes[createNodeId(`und.file-1`)].relationships[
            `node__article___NODE`
          ]
        ).not.toContain(createNodeId(`und.article-3`))
        // changed `field_tags`, `tag-1` no longer has back reference to `article-3`
        expect(
          nodes[createNodeId(`und.tag-1`)].relationships[`node__article___NODE`]
        ).not.toContain(createNodeId(`und.article-3`))
        // changed `field_tags`, `tag-2` now has back reference to `article-3`
        expect(
          nodes[createNodeId(`und.tag-2`)].relationships[`node__article___NODE`]
        ).toContain(createNodeId(`und.article-3`))
        // Created a new node article-9 with reference to tag-2
        expect(
          nodes[createNodeId(`und.tag-2`)].relationships[`node__article___NODE`]
        ).toContain(createNodeId(`und.article-9`))
      })
    })
  })

  describe(`Error handling`, () => {
    describe(`Does end activities if error is thrown`, () => {
      const got = require(`got`)
      beforeEach(() => {
        nodes = {}
        reporter.activityTimer.mockClear()
        activity.start.mockClear()
        activity.end.mockClear()
        got.mockClear()
        downloadFileSpy.mockClear()
      })

      it(`during data fetching`, async () => {
        got.mockImplementationOnce(() => {
          throw new Error(`data fetching failed`)
        })
        expect.assertions(5)

        try {
          await sourceNodes(args, { baseUrl })
        } catch (e) {
          expect(e).toMatchInlineSnapshot(`[Error: data fetching failed]`)
        }

        expect(reporter.activityTimer).toHaveBeenCalledTimes(1)
        expect(reporter.activityTimer).toHaveBeenNthCalledWith(
          1,
          `Fetch all data from Drupal`,
          { parentSpan: undefined }
        )

        expect(activity.start).toHaveBeenCalledTimes(1)
        expect(activity.end).toHaveBeenCalledTimes(1)
      })

      it(`during file downloading`, async () => {
        downloadFileSpy.mockImplementationOnce(() => {
          throw new Error(`file downloading failed`)
        })

        expect.assertions(6)

        try {
          await sourceNodes(args, { baseUrl })
        } catch (e) {
          expect(e).toMatchInlineSnapshot(`[Error: file downloading failed]`)
        }

        expect(reporter.activityTimer).toHaveBeenCalledTimes(2)
        expect(reporter.activityTimer).toHaveBeenNthCalledWith(
          1,
          `Fetch all data from Drupal`,
          { parentSpan: undefined }
        )
        expect(reporter.activityTimer).toHaveBeenNthCalledWith(
          2,
          `Remote file download`,
          { parentSpan: undefined }
        )

        expect(activity.start).toHaveBeenCalledTimes(2)
        expect(activity.end).toHaveBeenCalledTimes(2)
      })

      it(`during refresh webhook handling`, async () => {
        expect.assertions(5)

        await sourceNodes(
          {
            ...args,
            webhookBody: {
              malformattedPayload: true,
            },
          },
          { baseUrl }
        )

        expect(reporter.warn).toHaveBeenCalledTimes(2)
        expect(reporter.activityTimer).toHaveBeenCalledTimes(1)
        expect(reporter.activityTimer).toHaveBeenNthCalledWith(
          1,
          `loading Drupal content changes`,
          expect.anything()
        )

        expect(activity.start).toHaveBeenCalledTimes(1)
        expect(activity.end).toHaveBeenCalledTimes(1)
      })

      it(`during fastbuilds sync`, async () => {
        expect.assertions(5)

        try {
          const fastBuilds = true
          // Mock the lastFetched timestamp to an invalid value.
          args.store.getState.mockReturnValue({
            status: {
              plugins: {
                "gatsby-source-drupal": {
                  lastFetched: 1000000000,
                },
              },
            },
          })

          await sourceNodes(args, { baseUrl, fastBuilds })
        } catch (e) {
          expect(e).toBeTruthy()
        }

        expect(reporter.activityTimer).toHaveBeenCalledTimes(1)
        expect(reporter.activityTimer).toHaveBeenNthCalledWith(
          1,
          `Fetch incremental changes from Drupal`,
          { parentSpan: {} }
        )

        expect(activity.start).toHaveBeenCalledTimes(1)
        expect(activity.end).toHaveBeenCalledTimes(1)
      })
    })
  })
})
