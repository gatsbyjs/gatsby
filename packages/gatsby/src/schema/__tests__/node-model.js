const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)
const { LocalNodeModel } = require(`../node-model`)
const { build } = require(`..`)
const typeBuilders = require(`../types/type-builders`)
const { isLmdbStore } = require(`../../datastore`)

const nodes = require(`./fixtures/node-model`)

describe(`NodeModel`, () => {
  let nodeModel
  let schema
  const createPageDependency = jest.fn()

  const allNodeTypes = [
    `File`,
    `Directory`,
    `Site`,
    `SitePage`,
    `SiteFunction`,
    `SitePlugin`,
    `SiteBuildMetadata`,
    `Author`,
    `Contributor`,
    `ExternalFile`,
    `Post`,
  ]

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
      union AllFiles = File | ExternalFile

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
          result.every(r => [`File`, `ExternalFile`].includes(r.internal.type))
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

      it(`creates page dependencies with all connection types`, () => {
        nodeModel.getAllNodes({}, { path: `/` })
        allNodeTypes.forEach(typeName => {
          expect(createPageDependency).toHaveBeenCalledWith({
            path: `/`,
            connection: typeName,
          })
        })
        expect(createPageDependency).toHaveBeenCalledTimes(allNodeTypes.length)
      })

      it(`creates page dependencies when called with context and connection type`, () => {
        nodeModel
          .withContext({ path: `/` })
          .getAllNodes({ type: `Post` }, { connectionType: `Post` })
        expect(createPageDependency).toHaveBeenCalledTimes(1)
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          connection: `Post`,
        })
      })

      it(`creates page dependencies with all connection types when called with context without connection type`, () => {
        nodeModel.withContext({ path: `/` }).getAllNodes()
        allNodeTypes.forEach(typeName => {
          expect(createPageDependency).toHaveBeenCalledWith({
            path: `/`,
            connection: typeName,
          })
        })
        expect(createPageDependency).toHaveBeenCalledTimes(allNodeTypes.length)
      })

      it(`allows to opt-out of automatic dependency tracking`, () => {
        nodeModel.getAllNodes({}, { path: `/`, track: false })
        expect(createPageDependency).not.toHaveBeenCalled()
      })

      it(`allows to opt-out of automatic dependency tracking with context`, () => {
        nodeModel.withContext({ path: `/` }).getAllNodes({}, { track: false })
        expect(createPageDependency).not.toHaveBeenCalled()
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
            `ExternalFile`,
          ])
        )
      })
    })

    describe(`runQuery`, () => {
      it(`returns first result only`, async () => {
        const type = `Post`
        const query = {
          filter: { frontmatter: { published: { eq: false } } },
        }
        nodeModel.replaceFiltersCache()
        const result = await nodeModel.findOne({
          query,
          type,
        })
        expect(result.id).toBe(`post1`)
      })

      it(`returns all results`, async () => {
        const type = `Post`
        const query = {
          filter: { frontmatter: { published: { eq: false } } },
        }
        nodeModel.replaceFiltersCache()
        const { entries, totalCount } = await nodeModel.findAll({
          query,
          type,
        })
        const result = Array.from(entries)
        const count = await totalCount()
        expect(count).toBe(2)
        expect(result[0].id).toBe(`post1`)
        expect(result[1].id).toBe(`post3`)
      })

      it(`creates page dependencies`, async () => {
        const type = `Post`
        const query = {
          filter: { frontmatter: { published: { eq: false } } },
        }
        nodeModel.replaceFiltersCache()
        await nodeModel.findAll(
          {
            query,
            type,
          },
          { path: `/` }
        )
        expect(createPageDependency).toHaveBeenCalledTimes(1)
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          connection: `Post`,
        })
      })

      it(`creates page dependencies when called with context`, async () => {
        const type = `Post`
        const query = {
          filter: { frontmatter: { published: { eq: false } } },
        }
        nodeModel.replaceFiltersCache()
        await nodeModel.withContext({ path: `/` }).findAll({
          query,
          type,
        })
        expect(createPageDependency).toHaveBeenCalledTimes(1)
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          connection: `Post`,
        })
      })

      it(`creates page dependencies with connection type`, async () => {
        const type = `Post`
        const query = {
          filter: { frontmatter: { published: { eq: false } } },
        }
        nodeModel.replaceFiltersCache()
        await nodeModel.findAll(
          {
            query,
            type,
          },
          { path: `/`, connectionType: `Post` }
        )
        expect(createPageDependency).toHaveBeenCalledTimes(1)
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          connection: `Post`,
        })
      })

      it(`creates page dependencies with individual nodes when connectionType is null`, async () => {
        const type = `Post`
        const query = {
          filter: { frontmatter: { published: { eq: false } } },
        }
        nodeModel.replaceFiltersCache()
        await nodeModel.findAll(
          {
            query,
            type,
          },
          { path: `/`, connectionType: null }
        )
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

      it(`allows to opt-out of dependency tracking`, async () => {
        const type = `Post`
        const query = {
          filter: { frontmatter: { published: { eq: false } } },
        }
        nodeModel.replaceFiltersCache()
        await nodeModel.findAll(
          {
            query,
            type,
          },
          { path: `/`, track: false }
        )
        expect(createPageDependency).not.toHaveBeenCalled()
      })

      it(`allows to opt-out of dependency tracking with context`, async () => {
        const type = `Post`
        const query = {
          filter: { frontmatter: { published: { eq: false } } },
        }
        nodeModel.replaceFiltersCache()
        await nodeModel.withContext({ path: `/` }).findAll(
          {
            query,
            type,
          },
          { track: false }
        )
        expect(createPageDependency).not.toHaveBeenCalled()
      })

      it(`doesn't allow querying union types`, () => {
        const type = `AllFiles`
        const query = {}
        nodeModel.replaceFiltersCache()
        const result = nodeModel.findOne({
          query,
          type,
        })
        return expect(result).rejects.toThrowError(
          `Querying GraphQLUnion types is not supported.`
        )
      })

      it(`handles interface types`, async () => {
        const type = `TeamMember`
        const query = { name: { ne: null } }
        nodeModel.replaceFiltersCache()
        const result = await nodeModel.findOne({
          query,
          type,
        })
        expect(result.name).toBe(`Person1`)
      })

      it(`allows passing GraphQLType instead of type name`, async () => {
        const type = schema.getType(`File`)
        const query = {
          filter: {
            children: { elemMatch: { internal: { type: { eq: `Post` } } } },
          },
        }
        nodeModel.replaceFiltersCache()
        const { entries, totalCount } = await nodeModel.findAll({
          query,
          type,
        })
        const result = Array.from(entries)
        const count = await totalCount()
        expect(count).toBe(2)
        expect(result[0].id).toBe(`file1`)
        expect(result[1].id).toBe(`file3`)
      })

      it(`handles elemMatch`, async () => {
        const type = `Post`
        const query = {
          filter: {
            nestedObject: { elemMatch: { nestedValue: { eq: `2` } } },
          },
        }
        nodeModel.replaceFiltersCache()
        const result = await nodeModel.findOne({
          query,
          type,
        })
        expect(result).toBeDefined()
        expect(result.id).toEqual(`post2`)
      })

      // FIXME: Filters on date instances are not supported yet
      //  SIFT requires such filters to be expressed as Date instances but we
      //  don't know if date is stored as `Date` instance or `string`
      //  so can't really do that
      //  See https://github.com/crcn/sift.js#date-comparison
      it.skip(`queries date instances in nodes`, async () => {
        const type = `Post`
        const query = {
          filter: {
            frontmatter: {
              date: { lte: `2018-01-01T00:00:00Z` },
            },
          },
        }
        nodeModel.replaceTypeKeyValueCache()
        const { entries, totalCount } = await nodeModel.findAll({
          query,
          type,
        })
        const result = Array.from(entries)
        const count = await totalCount()
        expect(result).toBeDefined()
        expect(count).toEqual(2)
        expect(result[0].id).toEqual(`post2`)
        expect(result[1].id).toEqual(`post3`)
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

      it(`returns null when object's top-most ancestor doesn't match the provided predicate`, () => {
        const node = nodeModel.getNodeById({ id: `post1` })
        const obj = node.frontmatter.authors
        const predicate = () => false
        const result = nodeModel.findRootNodeAncestor(obj, predicate)
        expect(result).toBe(null)
      })
    })

    describe(`createPageDependency`, () => {
      it(`it calls upstream createPageDependency for single nodes`, () => {
        nodeModel.createPageDependency({
          path: `/`,
          nodeId: `person2`,
        })
        expect(createPageDependency).toHaveBeenCalledTimes(1)
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          nodeId: `person2`,
        })
      })

      it(`it calls upstream createPageDependency for connections of concrete types`, () => {
        nodeModel.createPageDependency({
          path: `/`,
          connection: `Author`,
        })
        expect(createPageDependency).toHaveBeenCalledTimes(1)
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          connection: `Author`,
        })
      })

      it(`it calls upstream createPageDependency with concrete types for node interface connections`, () => {
        nodeModel.createPageDependency({
          path: `/`,
          connection: `TeamMember`,
        })

        // TeamMember is interface with Author and Contributor types implementing it
        expect(createPageDependency).toHaveBeenCalledTimes(2)
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          connection: `Author`,
        })
        expect(createPageDependency).toHaveBeenCalledWith({
          path: `/`,
          connection: `Contributor`,
        })
      })
    })
  })

  describe(`materialization`, () => {
    let resolveBetterTitleMock
    let resolveOtherTitleMock
    let resolveSlugMock
    let materializationSpy
    beforeEach(async () => {
      const nodes = (() => [
        {
          id: `id1`,
          title: `Foo`,
          nested: {
            foo: `foo1`,
            bar: `bar1`,
          },
          internal: {
            type: `Test`,
            contentDigest: `0`,
          },
        },
        {
          id: `id2`,
          title: `Bar`,
          hidden: false,
          nested: {
            foo: `foo2`,
            bar: `bar2`,
          },
          internal: {
            type: `Test`,
            contentDigest: `1`,
          },
        },
        // Test2 is a special type that must have no nodes!
        {
          id: `id3`,
          internal: {
            type: `Test3`,
            contentDigest: `2`,
          },
        },
        {
          id: `id4`,
          Meta: {
            Date: `1`,
            Category: `Gatsby`,
          },
          internal: {
            type: `Test4`,
            contentDigest: `4`,
          },
        },
        {
          id: `id5`,
          Meta: {
            Date: `2`,
            Category: `Gatsby`,
          },
          internal: {
            type: `Test4`,
            contentDigest: `5`,
          },
        },
        {
          id: `id6`,
          Meta: {
            Date: `1`,
            Category: `Gatsby`,
          },
          internal: {
            type: `Test5`,
            contentDigest: `6`,
          },
        },
        {
          id: `id7`,
          Meta: {
            Date: `2`,
            Category: `NotGatsby`,
          },
          internal: {
            type: `Test5`,
            contentDigest: `7`,
          },
        },
        {
          id: `id8`,
          toBeResolvedInAnotherField: 2,
          enabled: true,
          internal: {
            type: `Test6`,
            contentDigest: `8`,
          },
        },
        {
          id: `id9`,
          toBeResolvedInAnotherField: 1,
          enabled: true,
          internal: {
            type: `Test6`,
            contentDigest: `9`,
          },
        },
      ])()
      store.dispatch({ type: `DELETE_CACHE` })
      nodes.forEach(node =>
        actions.createNode(node, { name: `test` })(store.dispatch)
      )
      resolveBetterTitleMock = jest.fn()
      resolveOtherTitleMock = jest.fn()
      resolveSlugMock = jest.fn()
      store.dispatch({
        type: `CREATE_TYPES`,
        payload: [
          typeBuilders.buildInterfaceType({
            name: `TestInterface`,
            fields: {
              slug: { type: `String` },
            },
          }),

          typeBuilders.buildInterfaceType({
            name: `TestNestedInterface`,
            fields: {
              foo: { type: `String` },
            },
            resolveType: value => value.kind,
          }),

          typeBuilders.buildObjectType({
            name: `TestNested`,
            fields: {
              foo: { type: `String` },
              bar: { type: `String` },
            },
            interfaces: [`TestNestedInterface`],
          }),

          typeBuilders.buildObjectType({
            name: `Test`,
            interfaces: [`Node`, `TestInterface`],
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
              hidden: {
                type: `Boolean!`,
                resolve: parent => Boolean(parent.hidden),
              },
              nested: {
                type: `TestNested`,
                resolve: source => source.nested,
              },
              arrayWithNulls: {
                type: `[TestNestedInterface]`,
                resolve: source => [
                  null,
                  { kind: `TestNested`, foo: source.id },
                  undefined,
                ],
              },
              slug: {
                type: `String`,
                resolve: source => {
                  resolveSlugMock()
                  return source.id
                },
              },

              // for concurrent materialization test
              intentionallySlowResolver1: {
                type: `Boolean!`,
                resolve: async () => {
                  await new Promise(resolve => setTimeout(resolve, 1000))
                  return true
                },
              },
              intentionallySlowResolver2: {
                type: `Boolean!`,
                resolve: async () => {
                  await new Promise(resolve => setTimeout(resolve, 1000))
                  return true
                },
              },
            },
          }),
          typeBuilders.buildObjectType({
            name: `Test2`,
            interfaces: [`Node`, `TestInterface`],
            fields: {
              slug: {
                type: `String`,
                resolve: source => source.id,
              },
            },
          }),
          typeBuilders.buildObjectType({
            name: `Test3`,
            interfaces: [`Node`, `TestInterface`],
            fields: {
              slug: {
                type: `String`,
                resolve: source => source.id,
              },
            },
          }),
          typeBuilders.buildObjectType({
            name: `Test4Meta`,
            fields: {
              Date: {
                type: `String`,
                resolve(source) {
                  // Swap sorting order for test
                  return source.Date === `1` ? `2` : `1`
                },
              },
            },
          }),
          typeBuilders.buildObjectType({
            name: `Test5Meta`,
            fields: {
              Date: {
                type: `String`,
                resolve(source) {
                  return source.Date
                },
              },
              Category: {
                type: `String`,
                resolve(source) {
                  return source.Category
                },
              },
            },
          }),
          typeBuilders.buildObjectType({
            name: `Test6`,
            interfaces: [`Node`],
            fields: {
              sort_order: {
                type: `Int!`,
                resolve: source => source.toBeResolvedInAnotherField,
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
        createPageDependency,
      })
      materializationSpy = jest.spyOn(nodeModel, `_doResolvePrepareNodesQueue`)
    })

    it(`should not resolve prepared nodes more than once`, async () => {
      nodeModel.replaceFiltersCache()
      await nodeModel.findAll(
        {
          query: { filter: { betterTitle: { eq: `foo` } } },
          type: `Test`,
        },
        { path: `/` }
      )
      expect(resolveBetterTitleMock.mock.calls.length).toBe(2)
      expect(resolveOtherTitleMock.mock.calls.length).toBe(0)
      nodeModel.replaceFiltersCache()
      await nodeModel.findAll(
        {
          query: { filter: { betterTitle: { eq: `foo` } } },
          type: `Test`,
        },
        { path: `/` }
      )
      expect(resolveBetterTitleMock.mock.calls.length).toBe(2)
      expect(resolveOtherTitleMock.mock.calls.length).toBe(0)
      nodeModel.replaceFiltersCache()
      await nodeModel.findAll(
        {
          query: {
            filter: { betterTitle: { eq: `foo` }, otherTitle: { eq: `Bar` } },
          },
          type: `Test`,
        },
        { path: `/` }
      )
      expect(resolveBetterTitleMock.mock.calls.length).toBe(2)
      expect(resolveOtherTitleMock.mock.calls.length).toBe(2)
      nodeModel.replaceFiltersCache()
      await nodeModel.findAll(
        {
          query: {
            filter: { betterTitle: { eq: `foo` }, otherTitle: { eq: `Bar` } },
          },
          type: `Test`,
        },
        { path: `/` }
      )
      expect(resolveBetterTitleMock.mock.calls.length).toBe(2)
      expect(resolveOtherTitleMock.mock.calls.length).toBe(2)
      nodeModel.replaceFiltersCache()
      await nodeModel.findOne(
        {
          query: {
            filter: { betterTitle: { eq: `foo` }, otherTitle: { eq: `Bar` } },
          },
          type: `Test`,
        },
        { path: `/` }
      )
      expect(resolveBetterTitleMock.mock.calls.length).toBe(2)
      expect(resolveOtherTitleMock.mock.calls.length).toBe(2)
    })

    it(`should not resolve prepared nodes more than once (with mixed interfaces and node types)`, async () => {
      nodeModel.replaceFiltersCache()
      await nodeModel.findAll(
        {
          query: { filter: { slug: { eq: `id1` } } },
          type: `Test`,
        },
        { path: `/` }
      )
      expect(resolveSlugMock.mock.calls.length).toBe(2)
      expect(resolveBetterTitleMock.mock.calls.length).toBe(0)
      nodeModel.replaceFiltersCache()
      await nodeModel.findAll(
        {
          query: { filter: { slug: { eq: `id1` } } },
          type: `TestInterface`,
        },
        { path: `/` }
      )
      expect(resolveSlugMock.mock.calls.length).toBe(2)
      expect(resolveBetterTitleMock.mock.calls.length).toBe(0)
      nodeModel.replaceFiltersCache()
      await nodeModel.findAll(
        {
          query: {
            filter: { slug: { eq: `id1` }, betterTitle: { eq: `foo` } },
          },
          type: `Test`,
        },
        { path: `/` }
      )
      expect(resolveSlugMock.mock.calls.length).toBe(2)
      expect(resolveBetterTitleMock.mock.calls.length).toBe(2)
      nodeModel.replaceFiltersCache()
      await nodeModel.findAll(
        {
          query: {
            filter: { slug: { eq: `id1` } },
          },
          type: `TestInterface`,
        },
        { path: `/` }
      )
      expect(resolveSlugMock.mock.calls.length).toBe(2)
      expect(resolveBetterTitleMock.mock.calls.length).toBe(2)
      nodeModel.replaceFiltersCache()
      await nodeModel.findOne(
        {
          query: {
            filter: { slug: { eq: `id1` }, betterTitle: { eq: `foo` } },
          },
          type: `Test`,
        },
        { path: `/` }
      )
      expect(resolveSlugMock.mock.calls.length).toBe(2)
      expect(resolveBetterTitleMock.mock.calls.length).toBe(2)
    })

    it(`can filter by resolved fields`, async () => {
      nodeModel.replaceFiltersCache()
      const { entries, totalCount } = await nodeModel.findAll(
        {
          query: {
            filter: { hidden: { eq: false } },
          },
          type: `Test`,
        },
        { path: `/` }
      )
      const result = Array.from(entries)
      const count = await totalCount()
      expect(count).toBe(2)
      expect(result[0].id).toBe(`id1`)
      expect(result[1].id).toBe(`id2`)
    })

    it(`merges query caches when filtering by nested field`, async () => {
      // See https://github.com/gatsbyjs/gatsby/issues/26056
      nodeModel.replaceFiltersCache()
      const { entries: entries1, totalCount: totalCount1 } =
        await nodeModel.findAll(
          {
            query: {
              filter: { nested: { foo: { eq: `foo1` } } },
            },
            type: `Test`,
          },
          { path: `/` }
        )
      const { entries: entries2, totalCount: totalCount2 } =
        await nodeModel.findAll(
          {
            query: {
              filter: { nested: { bar: { eq: `bar2` } } },
            },
            type: `Test`,
          },
          { path: `/` }
        )
      const result1 = Array.from(entries1)
      const result2 = Array.from(entries2)
      const count1 = await totalCount1()
      const count2 = await totalCount2()

      expect(result1).toBeTruthy()
      expect(count1).toBe(1)
      expect(result1[0].id).toBe(`id1`)

      expect(result2).toBeTruthy()
      expect(count2).toBe(1)
      expect(result2[0].id).toBe(`id2`)
    })

    it(`always uses a custom resolvers for query fields`, async () => {
      // See https://github.com/gatsbyjs/gatsby/issues/27368
      nodeModel.replaceFiltersCache()
      const { entries: entries1 } = await nodeModel.findAll(
        {
          query: {
            sort: {
              fields: [`Meta.Date`],
              order: [`desc`],
            },
          },
          type: `Test4`,
        },
        { path: `/` }
      )
      const { entries: entries2 } = await nodeModel.findAll(
        {
          query: {
            filter: { Meta: { Category: { eq: `Gatsby` } } },
            sort: {
              fields: [`Meta.Date`],
              order: [`desc`],
            },
          },
          type: `Test4`,
        },
        { path: `/` }
      )

      const result1 = Array.from(entries1)
      const result2 = Array.from(entries2)

      expect(result1).toBeTruthy()
      expect(result1.map(node => node.id)).toEqual([`id4`, `id5`])

      expect(result2).toBeTruthy()
      expect(result2.map(node => node.id)).toEqual([`id4`, `id5`])
    })

    it(`sorts correctly by fields with custom resolvers`, async () => {
      // See https://github.com/gatsbyjs/gatsby/issues/28047
      nodeModel.replaceFiltersCache()

      // This is required to setup a state after which the error reveals itself
      const result1 = await nodeModel.findOne(
        {
          query: {
            filter: { id: { regex: `/non-existing/` } },
          },
          type: `Test5`,
        },
        { path: `/` }
      )

      // Filter by the same regex with sorting
      const { entries } = await nodeModel.findAll(
        {
          query: {
            filter: { id: { regex: `/id/` } },
            sort: {
              fields: [`Meta.Date`],
              order: [`desc`],
            },
          },
          type: `Test5`,
        },
        { path: `/` }
      )
      const result2 = Array.from(entries)

      expect(result1).toEqual(null)

      expect(Array.isArray(result2)).toBeTruthy()
      expect(result2.map(node => node.id)).toEqual([`id7`, `id6`])
    })

    it(`sorts correctly by fields with custom resolvers if GC happen mid query`, async () => {
      nodeModel.replaceFiltersCache()

      // populate filters cache
      await nodeModel.findAll(
        {
          query: {},
          type: `Test6`,
        },
        { path: `/` }
      )

      // borrowed from https://unpkg.com/browse/expose-gc@1.0.0/function.js
      const v8 = require(`v8`)
      const vm = require(`vm`)
      v8.setFlagsFromString(`--expose_gc`)
      const gc = vm.runInNewContext(`gc`)

      const { clearKeptObjects } = require(`lmdb`)

      const actualOrderBy = jest.requireActual(`lodash`).orderBy
      const spy = jest.spyOn(require(`lodash`), `orderBy`)
      spy.mockImplementationOnce((...args) => {
        // very implementation specific case:
        // We don't hold full nodes strongly in gatsby anymore so they can be potentially
        // GCed mid execution of query. For this test we force all weakly held nodes to be
        // dropped
        clearKeptObjects()
        gc()
        return actualOrderBy(...args)
      })

      // query will use same filters cache as previous query (important)
      // but will use sorting that requires Materialization (sort_order has custom resolver)
      const { entries } = await nodeModel.findAll(
        {
          query: {
            sort: {
              fields: [`sort_order`],
              order: [`asc`],
            },
          },
          type: `Test6`,
        },
        { path: `/` }
      )
      const result = Array.from(entries)
      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(`id9`)
      expect(result[1].id).toEqual(`id8`)
    })

    it(`handles nulish values within array of interface type`, async () => {
      nodeModel.replaceFiltersCache()
      const { entries, totalCount } = await nodeModel.findAll(
        {
          query: {
            filter: { arrayWithNulls: { elemMatch: { foo: { eq: `id1` } } } },
          },
          type: `Test`,
        },
        { path: `/` }
      )
      const result = Array.from(entries)
      const count = await totalCount()
      expect(result).toBeTruthy()
      expect(count).toEqual(1)
      expect(result[0].id).toEqual(`id1`)
    })

    it(`handles fields with custom resolvers on interfaces having multiple implementations`, async () => {
      nodeModel.replaceFiltersCache()
      const result = await nodeModel.findOne(
        {
          query: {
            filter: { slug: { eq: `id3` } },
          },
          type: `TestInterface`,
        },
        { path: `/` }
      )
      expect(result).toBeTruthy()
      expect(result.id).toEqual(`id3`)
    })

    it(`correctly merges resolved fields when multiple concurrent materializations happen for same node`, async () => {
      nodeModel.replaceFiltersCache()

      const query1Promise = nodeModel.findAll(
        {
          query: {
            filter: { intentionallySlowResolver1: { eq: true } },
          },
          type: `Test`,
        },
        { path: `/` }
      )

      // we batch and merge materialization runs scheduled in same event loop turn
      // so just triggering adding small time delay so that we run 2 concurrent ones instead

      await new Promise(resolve => process.nextTick(resolve))

      const query2Promise = nodeModel.findAll(
        {
          query: {
            filter: { intentionallySlowResolver2: { eq: true } },
          },
          type: `Test`,
        },
        { path: `/` }
      )

      await Promise.all([query1Promise, query2Promise])

      // make sure materialization wasn't batched (test setup is correct)
      expect(materializationSpy).toBeCalledTimes(2)

      const resolvedFieldsForTestNodes = store
        .getState()
        .resolvedNodesCache.get(`Test`)

      // resolvedFieldsForTestNodes should contain both intentionallySlowResolver1 and intentionallySlowResolver2
      // so something like this:
      // Map {
      //   "id1" => Object {
      //     "intentionallySlowResolver1": true,
      //     "intentionallySlowResolver2": true,
      //   },
      //   "id2" => Object {
      //     "intentionallySlowResolver1": true,
      //     "intentionallySlowResolver2": true,
      //   },
      // }

      // we should have resolved fields for all nodes
      expect(Array.from(resolvedFieldsForTestNodes.keys())).toEqual(
        nodeModel.getAllNodes({ type: `Test` }).map(node => node.id)
      )

      // we should have all fields merged on all nodes
      expect(Array.from(resolvedFieldsForTestNodes.values())).toEqual(
        expect.arrayContaining([
          {
            intentionallySlowResolver1: true,
            intentionallySlowResolver2: true,
          },
        ])
      )
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
        const trackedRootNode =
          nodeModel.findRootNodeAncestor(copiedInlineObject)

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
        const trackedRootNode =
          nodeModel.findRootNodeAncestor(copiedInlineObject)

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
        const trackedRootNode =
          nodeModel.findRootNodeAncestor(copiedInlineObject)

        expect(trackedRootNode).not.toEqual(node)
      })
    })

    describe(`Tracks nodes returned by queries`, () => {
      it(`Tracks objects when running query without filter`, async () => {
        nodeModel.replaceFiltersCache()
        const { entries, totalCount } = await nodeModel.findAll({
          query: {},
          type: schema.getType(`Test`),
        })
        const result = Array.from(entries)
        const count = await totalCount()

        expect(count).toEqual(2)
        expect(nodeModel.findRootNodeAncestor(result[0].inlineObject)).toEqual(
          result[0]
        )
        expect(nodeModel.findRootNodeAncestor(result[1].inlineObject)).toEqual(
          result[1]
        )
      })

      it(`Tracks objects when running query with filter`, async () => {
        nodeModel.replaceFiltersCache()
        const { entries, totalCount } = await nodeModel.findAll({
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
        })
        const result = Array.from(entries)
        const count = await totalCount()

        expect(count).toEqual(1)
        expect(nodeModel.findRootNodeAncestor(result[0].inlineObject)).toEqual(
          result[0]
        )
      })
    })
  })

  describe(`circular references`, () => {
    if (isLmdbStore()) {
      // Circular references are disallowed in the strict mode, this tests are expected to fail
      return
    }
    describe(`directly on a node`, () => {
      beforeEach(async () => {
        // This tests whether addRootNodeToInlineObject properly prevents re-traversing the same key-value pair infinitely
        const circular = { i_am: `recursion!` }
        circular.circled = circular
        const indirectCircular = {
          down1: {
            down2: {},
          },
        }
        indirectCircular.down1.down2.deepCircular = indirectCircular

        const node = {
          id: `circleId`,
          parent: null,
          children: [],
          inlineObject: {
            field: `fieldOfFirstNode`,
          },
          inlineArray: [1, 2, 3],
          circular,
          indirect: {
            indirectCircular,
          },
          internal: {
            type: `Test`,
            contentDigest: `digest1`,
          },
        }
        actions.createNode(node, { name: `test` })(store.dispatch)

        await build({})
        const {
          schemaCustomization: { composer: schemaComposer },
        } = store.getState()
        schema = store.getState().schema

        nodeModel = new LocalNodeModel({
          schema,
          schemaComposer,
          createPageDependency,
        })
      })

      it(`trackInlineObjectsInRootNode should not infinitely loop on a circular reference`, () => {
        const node = nodeModel.getAllNodes({ type: `Test` })[0]
        const copiedInlineObject = { ...node.inlineObject }
        nodeModel.trackInlineObjectsInRootNode(copiedInlineObject)

        expect(nodeModel._trackedRootNodes instanceof WeakSet).toBe(true)
        expect(nodeModel._trackedRootNodes.has(node)).toEqual(true)
      })
    })
    describe(`not directly on a node`, () => {
      beforeEach(async () => {
        // This tests whether addRootNodeToInlineObject properly prevents re-traversing the same key-value pair infinitely
        const circular = { i_am: `recursion!` }
        circular.circled = { bar: { circular } }

        const node = {
          id: `circleId`,
          parent: null,
          children: [],
          inlineObject: {
            field: `fieldOfFirstNode`,
          },
          inlineArray: [1, 2, 3],
          foo: { circular },
          internal: {
            type: `Test`,
            contentDigest: `digest1`,
          },
        }
        actions.createNode(node, { name: `test` })(store.dispatch)

        await build({})
        const {
          schemaCustomization: { composer: schemaComposer },
        } = store.getState()
        schema = store.getState().schema

        nodeModel = new LocalNodeModel({
          schema,
          schemaComposer,
          createPageDependency,
        })
      })

      it(`trackInlineObjectsInRootNode should not infinitely loop on a circular reference`, () => {
        const node = nodeModel.getAllNodes({ type: `Test` })[0]
        const copiedInlineObject = { ...node.inlineObject }
        nodeModel.trackInlineObjectsInRootNode(copiedInlineObject)

        expect(nodeModel._trackedRootNodes instanceof WeakSet).toBe(true)
        expect(nodeModel._trackedRootNodes.has(node)).toEqual(true)
      })
    })
  })
})
