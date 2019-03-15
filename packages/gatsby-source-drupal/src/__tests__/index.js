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

describe(`gatsby-source-drupal`, () => {
  const nodes = {}
  const createNodeId = id => `generated-id-${id}`
  const baseUrl = `http://fixture`

  beforeAll(async () => {
    const args = {
      createNodeId,
      actions: {
        createNode: jest.fn(node => (nodes[node.id] = node)),
      },
    }

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
      nodes[createNodeId(`file-1`)].relationships[`node--article___NODE`]
    ).toEqual(
      expect.arrayContaining([
        createNodeId(`article-2`),
        createNodeId(`article-3`),
      ])
    )
    expect(
      nodes[createNodeId(`tag-1`)].relationships[`node--article___NODE`]
    ).toEqual(
      expect.arrayContaining([
        createNodeId(`article-1`),
        createNodeId(`article-3`),
      ])
    )
    expect(
      nodes[createNodeId(`tag-2`)].relationships[`node--article___NODE`]
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
})
