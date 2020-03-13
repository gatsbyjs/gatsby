jest.mock(`axios`, () => {
  return {
    get: path => {
      const last = path.split(`/`).pop()
      try {
        return { data: require(`./fixtures/${last}.json`) }
      } catch (e) {
        console.log(`Error`, e)
        return null
      }
    },
  }
})

jest.mock(`gatsby-source-filesystem`, () => {
  return {
    createRemoteFileNode: jest.fn(),
  }
})

const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

const { sourceNodes } = require(`../gatsby-node`)
const { handleWebhookUpdate } = require(`../utils`)

describe(`gatsby-source-drupal`, () => {
  const nodes = {}
  const createNodeId = id => `generated-id-${id}`
  const baseUrl = `http://fixture`
  const createContentDigest = jest.fn().mockReturnValue(`contentDigest`)
  const { objectContaining } = expect
  const actions = {
    createNode: jest.fn(node => (nodes[node.id] = node)),
  }

  const activity = {
    start: jest.fn(),
    end: jest.fn(),
  }
  const reporter = {
    info: jest.fn(),
    activityTimer: jest.fn(() => activity),
    log: jest.fn(),
  }

  const args = {
    createNodeId,
    createContentDigest,
    actions,
    reporter,
    getNode: id => nodes[id],
  }

  beforeAll(async () => {
    await sourceNodes(args, { baseUrl })
  })

  it(`Generates nodes`, () => {
    expect(Object.keys(nodes).length).not.toEqual(0)
    expect(nodes[createNodeId(`file-1`)]).toBeDefined()
    expect(nodes[createNodeId(`file-2`)]).toBeDefined()
    expect(nodes[createNodeId(`tag-1`)]).toBeDefined()
    expect(nodes[createNodeId(`tag-2`)]).toBeDefined()
    expect(nodes[createNodeId(`article-1`)]).toBeDefined()
    expect(nodes[createNodeId(`article-2`)]).toBeDefined()
    expect(nodes[createNodeId(`article-3`)]).toBeDefined()
  })

  it(`Nodes contain contentDigest`, () => {
    expect(nodes[createNodeId(`file-1`)]).toEqual(
      objectContaining({
        internal: objectContaining({ contentDigest: `contentDigest` }),
      })
    )
    expect(nodes[createNodeId(`article-2`)]).toEqual(
      objectContaining({
        internal: objectContaining({ contentDigest: `contentDigest` }),
      })
    )
    expect(nodes[createNodeId(`tag-1`)]).toEqual(
      objectContaining({
        internal: objectContaining({ contentDigest: `contentDigest` }),
      })
    )
  })

  it(`Nodes contain attributes data`, () => {
    expect(nodes[createNodeId(`file-1`)].filename).toEqual(`main-image.png`)
    expect(nodes[createNodeId(`article-2`)].title).toEqual(`Article #2`)
    expect(nodes[createNodeId(`tag-1`)].langcode).toEqual(`en`)
  })

  it(`Preserves attributes.id`, () => {
    expect(nodes[createNodeId(`article-2`)]._attributes_id).toEqual(22)
  })

  it(`Handles 1:1 relationship`, () => {
    expect(
      nodes[createNodeId(`article-1`)].relationships.field_main_image___NODE
    ).not.toBeDefined()
    expect(
      nodes[createNodeId(`article-2`)].relationships.field_main_image___NODE
    ).toEqual(createNodeId(`file-1`))
    expect(
      nodes[createNodeId(`article-3`)].relationships.field_main_image___NODE
    ).toEqual(createNodeId(`file-1`))
  })

  it(`Handles 1:N relationship`, () => {
    expect(
      nodes[createNodeId(`article-1`)].relationships.field_tags___NODE
    ).toEqual(
      expect.arrayContaining([createNodeId(`tag-1`), createNodeId(`tag-2`)])
    )
    expect(
      nodes[createNodeId(`article-2`)].relationships.field_tags___NODE
    ).not.toBeDefined()
    expect(
      nodes[createNodeId(`article-3`)].relationships.field_tags___NODE
    ).toEqual(expect.arrayContaining([createNodeId(`tag-1`)]))
  })

  it(`Creates back references`, () => {
    expect(
      nodes[createNodeId(`file-1`)].relationships[`node__article___NODE`]
    ).toEqual(
      expect.arrayContaining([
        createNodeId(`article-2`),
        createNodeId(`article-3`),
      ])
    )
    expect(
      nodes[createNodeId(`tag-1`)].relationships[`node__article___NODE`]
    ).toEqual(
      expect.arrayContaining([
        createNodeId(`article-1`),
        createNodeId(`article-3`),
      ])
    )
    expect(
      nodes[createNodeId(`tag-2`)].relationships[`node__article___NODE`]
    ).toEqual(expect.arrayContaining([createNodeId(`article-1`)]))
  })

  it(`Download files`, () => {
    const urls = [
      `/sites/default/files/main-image.png`,
      `/sites/default/files/secondary-image.png`,
    ].map(fileUrl => new URL(fileUrl, baseUrl).href)

    urls.forEach(url => {
      expect(createRemoteFileNode).toBeCalledWith(
        expect.objectContaining({
          url,
        })
      )
    })
  })

  describe(`Update webhook`, () => {
    describe(`Update content`, () => {
      describe(`Before update`, () => {
        it(`Attributes`, () => {
          expect(nodes[createNodeId(`article-3`)].title).toBe(`Article #3`)
        })
        it(`Relationships`, () => {
          expect(nodes[createNodeId(`article-3`)].relationships).toEqual({
            field_main_image___NODE: createNodeId(`file-1`),
            field_tags___NODE: [createNodeId(`tag-1`)],
          })
        })
        it(`Back references`, () => {
          expect(
            nodes[createNodeId(`file-1`)].relationships[`node__article___NODE`]
          ).toContain(createNodeId(`article-3`))
          expect(
            nodes[createNodeId(`tag-1`)].relationships[`node__article___NODE`]
          ).toContain(createNodeId(`article-3`))
          expect(
            nodes[createNodeId(`tag-2`)].relationships[`node__article___NODE`]
          ).not.toContain(createNodeId(`article-3`))
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
          expect(nodes[createNodeId(`article-3`)].title).toBe(
            `Article #3 - Updated`
          )
        })
        it(`Relationships`, () => {
          // removed `field_main_image`, changed `field_tags`
          expect(nodes[createNodeId(`article-3`)].relationships).toEqual({
            field_tags___NODE: [createNodeId(`tag-2`)],
          })
        })
        it(`Back references`, () => {
          // removed `field_main_image`, `file-1` no longer has back reference to `article-3`
          expect(
            nodes[createNodeId(`file-1`)].relationships[`node__article___NODE`]
          ).not.toContain(createNodeId(`article-3`))
          // changed `field_tags`, `tag-1` no longer has back reference to `article-3`
          expect(
            nodes[createNodeId(`tag-1`)].relationships[`node__article___NODE`]
          ).not.toContain(createNodeId(`article-3`))
          // changed `field_tags`, `tag-2` now has back reference to `article-3`
          expect(
            nodes[createNodeId(`tag-2`)].relationships[`node__article___NODE`]
          ).toContain(createNodeId(`article-3`))
        })
      })
    })

    describe(`Insert content`, () => {
      it(`Node doesn't exist before webhook`, () => {
        expect(nodes[createNodeId(`article-4`)]).not.toBeDefined()
        expect(
          nodes[createNodeId(`tag-1`)].relationships[`node__article___NODE`]
        ).not.toContain(createNodeId(`article-4`))
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
          expect(nodes[createNodeId(`article-4`)]).toBeDefined()
          expect(nodes[createNodeId(`article-4`)].title).toBe(`Article #4`)
        })

        it(`Adds back references to referenced nodes`, () => {
          expect(
            nodes[createNodeId(`tag-1`)].relationships[`node__article___NODE`]
          ).toContain(createNodeId(`article-4`))
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
    expect(nodes[createNodeId(`file-1`)]).toBeDefined()
    expect(nodes[createNodeId(`file-2`)]).toBeDefined()
    expect(nodes[createNodeId(`tag-1`)]).toBeUndefined()
    expect(nodes[createNodeId(`tag-2`)]).toBeUndefined()
    expect(nodes[createNodeId(`article-1`)]).toBeDefined()
    expect(nodes[createNodeId(`article-2`)]).toBeDefined()
    expect(nodes[createNodeId(`article-3`)]).toBeDefined()
  })

  it(`Verify JSON:API includes relationships`, async () => {
    // Reset nodes and test includes relationships.
    Object.keys(nodes).forEach(key => delete nodes[key])
    const disallowedLinkTypes = [`self`, `describedby`, `taxonomy_term--tags`]
    const filters = {
      "node--article": `include=field_tags`,
    }
    const apiBase = `jsonapi-includes`
    await sourceNodes(args, { baseUrl, apiBase, disallowedLinkTypes, filters })
    expect(Object.keys(nodes).length).not.toEqual(0)
    expect(nodes[createNodeId(`tag-1`)]).toBeUndefined()
    expect(nodes[createNodeId(`tag-2`)]).toBeUndefined()
    expect(nodes[createNodeId(`tag-3`)]).toBeDefined()
    expect(nodes[createNodeId(`article-5`)]).toBeDefined()
  })
})
