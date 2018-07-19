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

const { sourceNodes } = require(`../gatsby-node`)

describe(`gatsby-source-drupal`, () => {
  const nodes = {}
  const createNodeId = id => `generated-id-${id}`

  beforeAll(async () => {
    const args = {
      createNodeId,
      actions: {
        createNode: jest.fn(node => (nodes[node.id] = node)),
      },
    }

    await sourceNodes(args, { baseUrl: `http://fixture` })
    // console.log({ nodes })
    console.log(nodes[createNodeId(`tag-2`)])
  })

  it(`Generates nodes`, () => {
    expect(Object.keys(nodes).length).not.toEqual(0)
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
})

// const { nodeFromData } = require(`../normalize`)
// const { idOverlayExample } = require(`./data.json`)

// describe(`node completion`, () => {
//   it(`should correctly generate node from jsonapi`, () => {
//     const node = nodeFromData(idOverlayExample, id => id)
//     expect(node.bundle).toEqual(idOverlayExample.attributes.bundle)
//     expect(node._attributes_id).toEqual(idOverlayExample.attributes.id)
//   })
// })
