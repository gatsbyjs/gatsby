const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)
const nodeStore = require(`../../db/nodes`)
require(`../../db/__tests__/fixtures/ensure-loki`)()
const { LocalNodeModel } = require(`../node-model`)
const { build } = require(`..`)
const typeBuilders = require(`../types/type-builders`)

const nodes = require(`./fixtures/node-model`)

describe(`NodeModel`, () => {
  let nodeModel
  let schema
  const createPageDependency = jest.fn()

  describe(`normal node tests`, () => {
    beforeEach(async () => {
      store.dispatch({ type: `DELETE_CACHE` })
      nodes.forEach(node =>
        actions.createNode(
          { ...node, internal: { ...node.internal } },
          { name: `test` }
        )(store.dispatch)
      )

      const types = `
      union AllFiles = File | RemoteFile

      interface TeamMember {
        name: String!
      }

      type Author implements TeamMember & Node {
        name: String!
      }

      type Contributor implements TeamMember & Node {
        name: String!
      }
    `
      store.dispatch({
        type: `CREATE_TYPES`,
        payload: types,
      })

      await build({})
      let schemaComposer
      ;({
        schemaCustomization: { composer: schemaComposer },
        schema,
      } = store.getState())

      nodeModel = new LocalNodeModel({
        schema,
        schemaComposer,
        nodeStore,
        createPageDependency,
      })
    })

    beforeEach(() => {
      createPageDependency.mockClear()
    })

    describe(`getNodeById`, () => {
      it(`returns node by id`, () => {
        const result = nodeModel.getNodeById({ id: `person3` })
        expect(result.name).toBe(`Person3`)
        expect(result.email).toBeNull()
      })

      it(`returns node by id and type`, () => {
        const result = nodeModel.getNodeById({ id: `person1`, type: `Author` })
        expect(result.name).toBe(`Person1`)
        expect(result.email).toBe(`person1@example.com`)
      })

      it(`returns node by id and union type`, () => {
        const result = nodeModel.getNodeById({ id: `file3`, type: `AllFiles` })
        expect(result.name).toBe(`File3`)
      })

      it(`returns node by id and interface type`, () => {
        const result = nodeModel.getNodeById({
          id: `person1`,
          type: `TeamMember`,
        })
        expect(result.name).toBe(`Person1`)
      })

      it(`creates page dependency`, () => {
        nodeModel.getNodeById({ id: `person3` }, { path: `/` })
        expect(createPageDependency).toHaveBeenCalledTimes(1)
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          nodeId: `person3`,
        })
      })

      it(`creates page dependency when called with context`, () => {
        nodeModel.withContext({ path: `/` }).getNodeById({ id: `person2` })
        expect(createPageDependency).toHaveBeenCalledTimes(1)
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          nodeId: `person2`,
        })
      })

      it(`returns null when no id provided`, () => {
        expect(nodeModel.getNodeById()).toBeNull()
        expect(nodeModel.getNodeById({})).toBeNull()
        expect(nodeModel.getNodeById({ id: null })).toBeNull()
      })

      it(`returns null when matching id does not match type`, () => {
        const result = nodeModel.getNodeById({ id: `person1`, type: `Post` })
        expect(result).toBeNull()
      })

      it(`returns null when no matching node found`, () => {
        const result = nodeModel.getNodeById({ id: `person4` })
        expect(result).toBeNull()
      })

      it(`does not create page dependency when no matching node found`, () => {
        nodeModel.getNodeById({ id: `person4` }, { path: `/` })
        expect(createPageDependency).not.toHaveBeenCalled()
      })
    })

    describe(`getNodesByIds`, () => {
      it(`returns nodes by ids`, () => {
        const result = nodeModel.getNodesByIds({ ids: [`person1`, `post2`] })
        expect(result.length).toBe(2)
        expect(result[0].name).toBe(`Person1`)
        expect(result[1].frontmatter.authors[0]).toBe(`person1`)
      })

      it(`returns nodes by ids and type`, () => {
        const result = nodeModel.getNodesByIds({
          ids: [`person1`, `post2`],
          type: `Author`,
        })
        expect(result.length).toBe(1)
        expect(result[0].name).toBe(`Person1`)
      })

      it(`returns nodes by ids and union type`, () => {
        const result = nodeModel.getNodesByIds({
          ids: [`file1`, `file2`, `file3`, `post1`],
          type: `AllFiles`,
        })
        expect(result.length).toBe(3)
        expect(
          result.every(r => [`File`, `RemoteFile`].includes(r.internal.type))
        ).toBeTruthy()
      })

      it(`returns nodes by ids and interface type`, () => {
        const result = nodeModel.getNodesByIds({
          ids: [`person1`, `person2`, `person3`, `post1`],
          type: `TeamMember`,
        })
        expect(result.length).toBe(3)
        expect(
          result.every(r => [`Author`, `Contributor`].includes(r.internal.type))
        ).toBeTruthy()
      })

      it(`creates page dependencies`, () => {
        nodeModel.getNodesByIds({ ids: [`person1`, `post2`] }, { path: `/` })
        expect(createPageDependency).toHaveBeenCalledTimes(2)
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          nodeId: `person1`,
        })
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          nodeId: `post2`,
        })
      })

      it(`creates page dependencies when called with context`, () => {
        nodeModel
          .withContext({ path: `/` })
          .getNodesByIds({ ids: [`person3`, `post3`] })
        expect(createPageDependency).toHaveBeenCalledTimes(2)
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          nodeId: `person3`,
        })
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          nodeId: `post3`,
        })
      })

      it(`returns empty array when no ids provided`, () => {
        expect(nodeModel.getNodesByIds()).toEqual([])
        expect(nodeModel.getNodesByIds({})).toEqual([])
        expect(nodeModel.getNodesByIds({ ids: null })).toEqual([])
        expect(nodeModel.getNodesByIds({ ids: [] })).toEqual([])
      })

      it(`returns empty array when matching ids don't match type`, () => {
        const result = nodeModel.getNodesByIds({
          ids: [`person1`, `post2`],
          type: `File`,
        })
        expect(result).toEqual([])
      })

      it(`returns empty array when no matching nodes found`, () => {
        const result = nodeModel.getNodesByIds({ ids: [`person4`, `post4`] })
        expect(result).toEqual([])
      })

      it(`does not create page dependencies when no matching nodes found`, () => {
        nodeModel.getNodesByIds({ ids: [`person4`, `post4`] }, { path: `/` })
        expect(createPageDependency).not.toHaveBeenCalled()
      })
    })

    describe(`getAllNodes`, () => {
      it(`returns all nodes`, () => {
        const result = nodeModel.getAllNodes()
        expect(result.length).toBe(9)
      })

      it(`returns all nodes of type`, () => {
        const result = nodeModel.getAllNodes({ type: `Author` })
        expect(result.length).toBe(2)
      })

      it(`returns all nodes of union type`, () => {
        const result = nodeModel.getAllNodes({ type: `AllFiles` })
        expect(result.length).toBe(3)
      })

      it(`returns all nodes of interface type`, () => {
        const result = nodeModel.getAllNodes({ type: `TeamMember` })
        expect(result.length).toBe(3)
      })

      it(`creates page dependencies`, () => {
        nodeModel.getAllNodes({}, { path: `/` })
        expect(createPageDependency).toHaveBeenCalledTimes(9)
      })

      it(`creates page dependencies when called with context and connection type`, () => {
        nodeModel
          .withContext({ path: `/` })
          .getAllNodes({ type: `Post` }, { connectionType: `Post` })
        expect(createPageDependency).toHaveBeenCalledTimes(1)
      })

      it(`does not create page dependencies when called with context without connection type`, () => {
        nodeModel.withContext({ path: `/` }).getAllNodes()
        expect(createPageDependency).toHaveBeenCalledTimes(0)
      })

      it(`returns empty array when no nodes of type found`, () => {
        const result = nodeModel.getAllNodes({ type: `Astronauts` })
        expect(result).toEqual([])
      })

      it(`does not create page dependencies when no matching nodes found`, () => {
        nodeModel.getAllNodes({ type: `Astronauts` }, { path: `/` })
        expect(createPageDependency).not.toHaveBeenCalled()
      })
    })

    describe(`getTypes`, () => {
      it(`returns all node types in the store`, () => {
        const result = nodeModel.getTypes()
        expect(result.length).toBe(5)
        expect(result).toEqual(
          expect.arrayContaining([
            `Author`,
            `Contributor`,
            `Post`,
            `File`,
            `RemoteFile`,
          ])
        )
      })
    })

    describe(`runQuery`, () => {
      it(`returns first result only`, async () => {
        const type = `Post`
        const query = { filter: { frontmatter: { published: { eq: false } } } }
        const firstOnly = true
        const result = await nodeModel.runQuery({ query, firstOnly, type })
        expect(result.id).toBe(`post1`)
      })

      it(`returns all results`, async () => {
        const type = `Post`
        const query = { filter: { frontmatter: { published: { eq: false } } } }
        const firstOnly = false
        const result = await nodeModel.runQuery({ query, firstOnly, type })
        expect(result.length).toBe(2)
        expect(result[0].id).toBe(`post1`)
        expect(result[1].id).toBe(`post3`)
      })

      it(`creates page dependencies`, async () => {
        const type = `Post`
        const query = { filter: { frontmatter: { published: { eq: false } } } }
        const firstOnly = false
        await nodeModel.runQuery({ query, firstOnly, type }, { path: `/` })
        expect(createPageDependency).toHaveBeenCalledTimes(2)
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          nodeId: `post1`,
        })
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          nodeId: `post3`,
        })
      })

      it(`creates page dependencies when called with context`, async () => {
        const type = `Post`
        const query = { filter: { frontmatter: { published: { eq: false } } } }
        const firstOnly = false
        await nodeModel
          .withContext({ path: `/` })
          .runQuery({ query, firstOnly, type })
        expect(createPageDependency).toHaveBeenCalledTimes(2)
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          nodeId: `post1`,
        })
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          nodeId: `post3`,
        })
      })

      it(`creates page dependencies with connection type`, async () => {
        const type = `Post`
        const query = { filter: { frontmatter: { published: { eq: false } } } }
        const firstOnly = false
        await nodeModel.runQuery(
          { query, firstOnly, type },
          { path: `/`, connectionType: `Post` }
        )
        expect(createPageDependency).toHaveBeenCalledTimes(1)
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          connection: `Post`,
        })
      })

      it(`doesn't allow querying union types`, () => {
        const type = `AllFiles`
        const query = {}
        const firstOnly = true
        const result = nodeModel.runQuery({ query, firstOnly, type })
        return expect(result).rejects.toThrowError(
          `Querying GraphQLUnion types is not supported.`
        )
      })

      it(`handles interface types`, async () => {
        const type = `TeamMember`
        const query = { name: { ne: null } }
        const firstOnly = true
        const result = await nodeModel.runQuery({ query, firstOnly, type })
        expect(result.name).toBe(`Person1`)
      })

      it(`allows passing GraphQLType instead of type name`, async () => {
        const type = schema.getType(`File`)
        const query = {
          filter: {
            children: { elemMatch: { internal: { type: { eq: `Post` } } } },
          },
        }
        const firstOnly = false
        const result = await nodeModel.runQuery({ query, firstOnly, type })
        expect(result.length).toBe(2)
        expect(result[0].id).toBe(`file1`)
        expect(result[1].id).toBe(`file3`)
      })
    })

    describe(`findRootNodeAncestor`, () => {
      it(`returns an object's top most ancestor node`, () => {
        const node = nodeModel.getNodeById({ id: `post1` })
        const obj = node.frontmatter.authors
        const result = nodeModel.findRootNodeAncestor(obj)
        expect(result.id).toBe(`file1`)
      })

      it(`returns an object's ancestor node that matches the provided predicate`, () => {
        const node = nodeModel.getNodeById({ id: `post1` })
        const obj = node.frontmatter.authors
        const predicate = obj => obj.internal && obj.internal.type === `File`
        const result = nodeModel.findRootNodeAncestor(obj, predicate)
        expect(result.id).toBe(`file1`)
      })
    })
  })

  describe(`prepare nodes caching`, () => {
    let resolveBetterTitleMock
    let resolveOtherTitleMock
    beforeEach(async () => {
      const nodes = (() => [
        {
          id: `id1`,
          title: `Foo`,
          internal: {
            type: `Test`,
            contentDigest: `0`,
          },
        },
      ])()
      store.dispatch({ type: `DELETE_CACHE` })
      nodes.forEach(node =>
        actions.createNode(node, { name: `test` })(store.dispatch)
      )
      resolveBetterTitleMock = jest.fn()
      resolveOtherTitleMock = jest.fn()
      store.dispatch({
        type: `CREATE_TYPES`,
        payload: [
          typeBuilders.buildObjectType({
            name: `Test`,
            interfaces: [`Node`],
            fields: {
              betterTitle: {
                type: `String`,
                resolve(parent) {
                  resolveBetterTitleMock()
                  return `I am amazing title: ${parent.title}`
                },
              },
              otherTitle: {
                type: `String`,
                resolve(parent) {
                  resolveOtherTitleMock()
                  return `I am the other amazing title: ${parent.title}`
                },
              },
            },
          }),
        ],
      })

      await build({})
      const {
        schemaCustomization: { composer: schemaComposer },
      } = store.getState()
      schema = store.getState().schema

      nodeModel = new LocalNodeModel({
        schema,
        schemaComposer,
        nodeStore,
        createPageDependency,
      })
    })

    it(`should not resolve prepared nodes more than once`, async () => {
      await nodeModel.runQuery(
        {
          query: { filter: { betterTitle: { eq: `foo` } } },
          firstOnly: false,
          type: `Test`,
        },
        { path: `/` }
      )
      expect(resolveBetterTitleMock.mock.calls.length).toBe(1)
      expect(resolveOtherTitleMock.mock.calls.length).toBe(0)
      await nodeModel.runQuery(
        {
          query: { filter: { betterTitle: { eq: `foo` } } },
          firstOnly: false,
          type: `Test`,
        },
        { path: `/` }
      )
      expect(resolveBetterTitleMock.mock.calls.length).toBe(1)
      expect(resolveOtherTitleMock.mock.calls.length).toBe(0)
      await nodeModel.runQuery(
        {
          query: {
            filter: { betterTitle: { eq: `foo` }, otherTitle: { eq: `Bar` } },
          },
          firstOnly: false,
          type: `Test`,
        },
        { path: `/` }
      )
      expect(resolveBetterTitleMock.mock.calls.length).toBe(1)
      expect(resolveOtherTitleMock.mock.calls.length).toBe(1)
      await nodeModel.runQuery(
        {
          query: {
            filter: { betterTitle: { eq: `foo` }, otherTitle: { eq: `Bar` } },
          },
          firstOnly: false,
          type: `Test`,
        },
        { path: `/` }
      )
      expect(resolveBetterTitleMock.mock.calls.length).toBe(1)
      expect(resolveOtherTitleMock.mock.calls.length).toBe(1)
      await nodeModel.runQuery(
        {
          query: {
            filter: { betterTitle: { eq: `foo` }, otherTitle: { eq: `Bar` } },
          },
          firstOnly: true,
          type: `Test`,
        },
        { path: `/` }
      )
      expect(resolveBetterTitleMock.mock.calls.length).toBe(1)
      expect(resolveOtherTitleMock.mock.calls.length).toBe(1)
    })
  })

  describe(`node tracking`, () => {
    beforeEach(async () => {
      const nodes = (() => [
        {
          id: `id1`,
          parent: null,
          children: [],
          inlineObject: {
            field: `fieldOfFirstNode`,
          },
          inlineArray: [1, 2, 3],
          internal: {
            type: `Test`,
            contentDigest: `digest1`,
          },
        },
        {
          id: `id2`,
          parent: null,
          children: [],
          inlineObject: {
            field: `fieldOfSecondNode`,
          },
          inlineArray: [1, 2, 3],
          internal: {
            type: `Test`,
            contentDigest: `digest2`,
          },
        },
      ])()
      store.dispatch({ type: `DELETE_CACHE` })
      nodes.forEach(node =>
        actions.createNode(node, { name: `test` })(store.dispatch)
      )

      await build({})
      const {
        schemaCustomization: { composer: schemaComposer },
      } = store.getState()
      schema = store.getState().schema

      nodeModel = new LocalNodeModel({
        schema,
        schemaComposer,
        nodeStore,
        createPageDependency,
      })
    })

    describe(`Tracks nodes read from cache by id`, () => {
      it(`Tracks inline objects`, () => {
        const node = nodeModel.getNodeById({ id: `id1` })
        const inlineObject = node.inlineObject
        const trackedRootNode = nodeModel.findRootNodeAncestor(inlineObject)

        expect(trackedRootNode).toEqual(node)
      })
      it(`Tracks inline arrays`, () => {
        const node = nodeModel.getNodeById({ id: `id1` })
        const inlineObject = node.inlineArray
        const trackedRootNode = nodeModel.findRootNodeAncestor(inlineObject)

        expect(trackedRootNode).toEqual(node)
      })
      it(`Doesn't track copied objects`, () => {
        const node = nodeModel.getNodeById({ id: `id1` })
        const copiedInlineObject = { ...node.inlineObject }
        const trackedRootNode = nodeModel.findRootNodeAncestor(
          copiedInlineObject
        )

        expect(trackedRootNode).not.toEqual(node)
      })
    })

    describe(`Tracks nodes read from cache by ids`, () => {
      it(`Tracks inline objects`, () => {
        const node = nodeModel.getNodesByIds({ ids: [`id1`] })[0]
        const inlineObject = node.inlineObject
        const trackedRootNode = nodeModel.findRootNodeAncestor(inlineObject)

        expect(trackedRootNode).toEqual(node)
      })
      it(`Tracks inline arrays`, () => {
        const node = nodeModel.getNodesByIds({ ids: [`id1`] })[0]
        const inlineObject = node.inlineArray
        const trackedRootNode = nodeModel.findRootNodeAncestor(inlineObject)

        expect(trackedRootNode).toEqual(node)
      })
      it(`Doesn't track copied objects`, () => {
        const node = nodeModel.getNodesByIds({ ids: [`id1`] })[0]
        const copiedInlineObject = { ...node.inlineObject }
        const trackedRootNode = nodeModel.findRootNodeAncestor(
          copiedInlineObject
        )

        expect(trackedRootNode).not.toEqual(node)
      })
    })

    describe(`Tracks nodes read from cache by list`, () => {
      it(`Tracks inline objects`, () => {
        const node = nodeModel.getAllNodes({ type: `Test` })[0]
        const inlineObject = node.inlineObject
        const trackedRootNode = nodeModel.findRootNodeAncestor(inlineObject)

        expect(trackedRootNode).toEqual(node)
      })
      it(`Tracks inline arrays`, () => {
        const node = nodeModel.getAllNodes({ type: `Test` })[0]
        const inlineObject = node.inlineArray
        const trackedRootNode = nodeModel.findRootNodeAncestor(inlineObject)

        expect(trackedRootNode).toEqual(node)
      })
      it(`Doesn't track copied objects`, () => {
        const node = nodeModel.getAllNodes({ type: `Test` })[0]
        const copiedInlineObject = { ...node.inlineObject }
        const trackedRootNode = nodeModel.findRootNodeAncestor(
          copiedInlineObject
        )

        expect(trackedRootNode).not.toEqual(node)
      })
    })

    describe(`Tracks nodes returned by queries`, () => {
      it(`Tracks objects when running query without filter`, async () => {
        const result = await nodeModel.runQuery({
          query: {},
          type: schema.getType(`Test`),
          firstOnly: false,
        })

        expect(result.length).toEqual(2)
        expect(nodeModel.findRootNodeAncestor(result[0].inlineObject)).toEqual(
          result[0]
        )
        expect(nodeModel.findRootNodeAncestor(result[1].inlineObject)).toEqual(
          result[1]
        )
      })

      it(`Tracks objects when running query with filter`, async () => {
        const result = await nodeModel.runQuery({
          query: {
            filter: {
              inlineObject: {
                field: {
                  eq: `fieldOfSecondNode`,
                },
              },
            },
          },
          type: schema.getType(`Test`),
          firstOnly: false,
        })

        expect(result.length).toEqual(1)
        expect(nodeModel.findRootNodeAncestor(result[0].inlineObject)).toEqual(
          result[0]
        )
      })
    })
  })
})
