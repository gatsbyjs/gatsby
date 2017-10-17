const Promise = require(`bluebird`)
const _ = require(`lodash`)
const json2csv = require(`json2csv`)

const { onCreateNode } = require(`../gatsby-node`)

describe(`Process  nodes correctly`, () => {
  const node = {
    id: `whatever`,
    parent: `SOURCE`,
    children: [],
    extension: `csv`,
    internal: {
      contentDigest: `whatever`,
      mediaType: `text/csv`,
    },
    name: `test`,
  }

  // Make some fake functions its expecting.
  const loadNodeContent = node => Promise.resolve(node.content)

  it(`correctly creates nodes from JSON which is an array of objects`, async () => {
    const fields = [`blue`, `funny`]
    const data = [{ blue: true, funny: `yup` }, { blue: false, funny: `nope` }]
    const csv = json2csv({ data: data, fields: fields })
    node.content = csv

    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const boundActionCreators = { createNode, createParentChildLink }

    await onCreateNode({
      node,
      loadNodeContent,
      boundActionCreators,
    }).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(2)
      expect(createParentChildLink).toHaveBeenCalledTimes(2)
    })
  })

  it(`correctly handles the options object that is passed to it`, async () => {
    node.content = `blue,funny\ntrue,yup\nfalse,nope`

    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const boundActionCreators = { createNode, createParentChildLink }

    await onCreateNode(
      {
        node,
        loadNodeContent,
        boundActionCreators,
      },
      { noheader: true }
    ).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(3)
      expect(createParentChildLink).toHaveBeenCalledTimes(3)
    })
  })

  it(`If the object has an id, it uses that as the id instead of the auto-generated one`, async () => {
    const fields = [`id`, `blue`, `funny`]
    const data = [
      { id: `foo`, blue: true, funny: `yup` },
      { blue: false, funny: `nope` },
    ]
    const csv = json2csv({ data: data, fields: fields })
    node.content = csv

    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const boundActionCreators = { createNode, createParentChildLink }

    await onCreateNode({
      node,
      loadNodeContent,
      boundActionCreators,
    }).then(() => {
      expect(createNode.mock.calls[0][0].id).toEqual(`foo`)
    })
  })

  it(`the different objects shouldn't get the same ID even if they have the same content`, async () => {
    const fields = [`id`, `blue`, `funny`]
    const data = [
      { id: `foo`, blue: true, funny: `yup` },
      { blue: false, funny: `nope` },
      { blue: false, funny: `nope` },
      { green: false, funny: `nope` },
    ]
    const csv = json2csv({ data: data, fields: fields })
    node.content = csv

    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const boundActionCreators = { createNode, createParentChildLink }

    await onCreateNode({
      node,
      loadNodeContent,
      boundActionCreators,
    }).then(() => {
      const ids = createNode.mock.calls.map(object => object[0].id)
      // Test that they're unique
      expect(_.uniq(ids).length).toEqual(4)
    })
  })
})
