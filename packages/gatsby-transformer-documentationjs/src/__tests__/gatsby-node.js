import groupBy from "lodash/groupBy"
import path from "path"
import gatsbyNode from "../gatsby-node"

describe(`gatsby-transformer-documentationjs: onCreateNode`, () => {
  let createdNodes
  let updatedNodes
  const createNodeId = jest.fn(id => id)
  const createContentDigest = jest.fn().mockReturnValue(`content-digest`)

  const getFileNode = fixture => {
    return {
      id: `node_1`,
      children: [],
      absolutePath: path.join(__dirname, `fixtures`, fixture),
      internal: {
        mediaType: `application/javascript`,
        type: `File`,
      },
    }
  }

  const actions = {
    createNode: jest.fn(n => createdNodes.push(n)),
    createParentChildLink: jest.fn(n => {
      updatedNodes.push(n)
      const parentNode = createdNodes.find(node => node.id === n.parent.id)
      if (parentNode) {
        parentNode.children.push(n.child.id)
      } else if (n.parent.id !== `node_1`) {
        throw new Error(`Creating parent-child link for not existing parent`)
      }
    }),
  }

  const run = async (node = node, opts = {}) => {
    createdNodes = []
    updatedNodes = []
    await gatsbyNode.onCreateNode(
      {
        node,
        actions,
        createNodeId,
        createContentDigest,
      },
      opts
    )
  }

  const extensionsToTest = [`.js`, `.jsx`]

  for (const extension of extensionsToTest) {
    describe(`Simple example (${extension})`, () => {
      beforeAll(async () => {
        await run(getFileNode(`code${extension}`))
      })

      it(`creates doc json apple node`, () => {
        const appleNode = createdNodes.find(node => node.name === `apple`)
        expect(appleNode).toBeDefined()
      })

      it(`should extract out a description, params, and examples`, () => {
        const appleNode = createdNodes.find(node => node.name === `apple`)

        expect(appleNode.examples.length).toBe(1)
        expect(appleNode.examples[0]).toMatchSnapshot(`example`)

        const appleDescriptionNode = createdNodes.find(
          node => node.id === appleNode.description___NODE
        )

        expect(appleDescriptionNode).toBeDefined()
        expect(appleDescriptionNode.internal.content).toMatchSnapshot(
          `description content`
        )

        const paramNode = createdNodes.find(
          node => node.id === appleNode.params___NODE[0]
        )

        expect(paramNode).toBeDefined()
        expect(paramNode.name).toMatchSnapshot(`param name`)

        const paramDescriptionNode = createdNodes.find(
          node => node.id === paramNode.description___NODE
        )

        expect(paramDescriptionNode).toBeDefined()
        expect(paramDescriptionNode.internal.content).toMatchSnapshot(
          `param description`
        )
      })

      it(`should extract out a captions from examples`, () => {
        const pearNode = createdNodes.find(node => node.name === `pear`)

        expect(pearNode.examples.length).toBe(2)
        expect(pearNode.examples).toMatchSnapshot(`examplesWithCaptions`)

        expect(pearNode.examples[1].caption).toBeDefined()

        const pearDescriptionNode = createdNodes.find(
          node => node.id === pearNode.description___NODE
        )

        expect(pearDescriptionNode).toBeDefined()
        expect(pearDescriptionNode.internal.content).toMatchSnapshot(
          `description content`
        )
      })

      it(`should extract code and docs location`, () => {
        const appleNode = createdNodes.find(node => node.name === `apple`)

        expect(appleNode.docsLocation).toBeDefined()
        expect(appleNode.docsLocation).toEqual(
          expect.objectContaining({
            start: expect.objectContaining({
              line: 1,
            }),
            end: expect.objectContaining({
              line: 7,
            }),
          })
        )

        expect(appleNode.codeLocation).toBeDefined()
        expect(appleNode.codeLocation).toEqual(
          expect.objectContaining({
            start: expect.objectContaining({
              line: 8,
            }),
            end: expect.objectContaining({
              line: 10,
            }),
          })
        )
      })

      it(`doesn't create multiple nodes with same id`, () => {
        const groupedById = groupBy(createdNodes, `id`)
        Object.keys(groupedById).forEach(id =>
          expect(groupedById[id].length).toBe(1)
        )
      })
    })
  }

  describe(`Complex example`, () => {
    beforeAll(async () => {
      await run(getFileNode(`complex-example.js`))
    })

    let callbackNode
    let typedefNode

    it(`should create top-level node for callback`, () => {
      callbackNode = createdNodes.find(
        node =>
          node.name === `CallbackType` &&
          node.kind === `typedef` &&
          node.parent === `node_1`
      )
      expect(callbackNode).toBeDefined()
    })

    describe(`should handle typedefs`, () => {
      it(`should create top-level node for typedef`, () => {
        typedefNode = createdNodes.find(
          node =>
            node.name === `ObjectType` &&
            node.kind === `typedef` &&
            node.parent === `node_1`
        )
        expect(typedefNode).toBeDefined()
      })

      let readyNode
      let nestedNode

      it(`should have property nodes for typedef`, () => {
        expect(typedefNode.properties___NODE).toBeDefined()
        expect(typedefNode.properties___NODE.length).toBe(2)
        ;[readyNode, nestedNode] = typedefNode.properties___NODE.map(paramID =>
          createdNodes.find(node => node.id === paramID)
        )
      })

      it(`should handle type applications`, () => {
        expect(readyNode).toMatchSnapshot()
      })

      let nestedFooNode
      let nestedOptionalNode
      let nestedCallbackNode

      it(`should have second param as nested object`, () => {
        expect(nestedNode.name).toBe(`nested`)
        expect(nestedNode.properties___NODE).toBeDefined()
        expect(nestedNode.properties___NODE.length).toBe(3)
        ;[nestedFooNode, nestedOptionalNode, nestedCallbackNode] =
          nestedNode.properties___NODE.map(paramID =>
            createdNodes.find(node => node.id === paramID)
          )
      })

      it(`should strip prefixes from nested nodes`, () => {
        expect(nestedFooNode.name).not.toContain(`nested`)
        expect(nestedFooNode.name).toEqual(`foo`)
      })

      it(`should handle optional types`, () => {
        expect(nestedOptionalNode.name).toEqual(`optional`)
        expect(nestedOptionalNode.optional).toEqual(true)
        expect(nestedOptionalNode.type).toEqual(
          expect.objectContaining({
            name: `number`,
            type: `NameExpression`,
          })
        )
      })

      it(`should handle typedefs in nested properties`, () => {
        expect(nestedCallbackNode.name).toEqual(`callback`)
        expect(nestedCallbackNode.optional).toEqual(false)
        expect(nestedCallbackNode.type).toEqual(
          expect.objectContaining({
            name: `CallbackType`,
            type: `NameExpression`,
            typeDef___NODE: callbackNode.id,
          })
        )
      })
    })

    describe(`should handle members`, () => {
      let complexNode
      let memberNode
      beforeAll(() => {
        complexNode = createdNodes.find(
          node => node.name === `complex` && node.parent === `node_1`
        )
      })

      it(`should create top-level node for complex type`, () => {
        expect(complexNode).toBeDefined()
      })

      it(`should have link from complex node to its members`, () => {
        expect(complexNode.members).toBeDefined()
        expect(complexNode.members.static___NODE).toBeDefined()
        expect(complexNode.members.static___NODE.length).toBe(1)

        memberNode = createdNodes.find(
          node => node.id === complexNode.members.static___NODE[0]
        )
        expect(memberNode).toBeDefined()
        expect(memberNode.parent).toEqual(complexNode.id)
      })

      it(`should handle type unions`, () => {
        expect(memberNode.type).toMatchSnapshot()
      })

      it(`should link to type to type definition`, () => {
        const typeElement = memberNode.type.elements.find(
          type => type.name === `ObjectType`
        )
        expect(typeElement.typeDef___NODE).toBe(typedefNode.id)
      })
    })

    it(`doesn't create multiple nodes with same id`, () => {
      const groupedById = groupBy(createdNodes, `id`)
      Object.keys(groupedById).forEach(id =>
        expect(groupedById[id].length).toBe(1)
      )
    })
  })

  describe(`Free floating comments`, () => {
    beforeAll(async () => {
      await run(getFileNode(`free-floating.js`))
    })

    it(`doesn't create multiple nodes with same id`, () => {
      const groupedById = groupBy(createdNodes, `id`)
      Object.keys(groupedById).forEach(id =>
        expect(groupedById[id].length).toBe(1)
      )
    })
  })

  describe(`JSDoc + Flow`, () => {
    beforeAll(async () => {
      await run(getFileNode(`jsdoc-and-flow.js`))
    })

    it(`merges JsDoc and flow types`, () => {
      const firstParamNodes = createdNodes.filter(node => node.name === `$0`)

      expect(firstParamNodes.length).toBe(1)
      expect(firstParamNodes[0].properties___NODE.length).toBe(1)

      const subField = createdNodes.find(
        node => node.id === firstParamNodes[0].properties___NODE[0]
      )

      expect(subField).toBeDefined()
      expect(subField.name).toBe(`nodeId`)
      expect(subField.type).toEqual(
        expect.objectContaining({
          name: `string`,
          type: `NameExpression`,
        })
      )
    })

    it(`flow: required param result in same data shape as JsDoc`, () => {
      const requiredFlowParam = createdNodes.find(
        node => node.name === `requiredParam`
      )

      expect(requiredFlowParam).toBeDefined()
      expect(requiredFlowParam).toEqual(
        expect.objectContaining({
          name: `requiredParam`,
          optional: false,
          type: expect.objectContaining({
            name: `string`,
            type: `NameExpression`,
          }),
        })
      )
    })

    it(`flow: optional param result in same data shape as JsDoc`, () => {
      const optionalFlowParam = createdNodes.find(
        node => node.name === `optionalParam`
      )

      expect(optionalFlowParam).toBeDefined()
      expect(optionalFlowParam).toEqual(
        expect.objectContaining({
          name: `optionalParam`,
          optional: true,
          type: expect.objectContaining({
            name: `number`,
            type: `NameExpression`,
          }),
        })
      )
    })
  })

  describe(`Sanity checks`, () => {
    it(`should extract create description nodes with markdown types`, () => {
      const types = groupBy(createdNodes, `internal.type`)
      expect(
        types.DocumentationJSComponentDescription.every(
          d => d.internal.mediaType === `text/markdown`
        )
      ).toBe(true)
    })

    it(`creates parent nodes before children`, () => {
      const seenNodes = []
      createdNodes.forEach(node => {
        seenNodes.push(node.id)

        node.children.forEach(childID => {
          expect(seenNodes.includes(childID)).not.toBe(true)
        })
      })
    })

    it(`should only process javascript File nodes`, async () => {
      await run({ internal: { mediaType: `text/x-foo` } })
      expect(createdNodes.length).toBe(0)

      await run({ internal: { mediaType: `application/javascript` } })
      expect(createdNodes.length).toBe(0)

      await run(getFileNode(`code.js`))
      expect(createdNodes.length).toBeGreaterThan(0)
    })
  })

  it(`doesn't cause a stack overflow for nodes of the same name`, () =>
    expect(run(getFileNode(`same-name.ts`))).resolves.toBeUndefined())
})
