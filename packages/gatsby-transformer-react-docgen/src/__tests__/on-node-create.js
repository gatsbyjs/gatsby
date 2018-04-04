import fs from "fs"
import path from "path"
import { groupBy } from "lodash"
import onCreateNode from "../on-node-create"

const readFile = file =>
  new Promise((y, n) => {
    fs.readFile(
      path.join(__dirname, `fixtures`, file),
      `utf8`,
      (err, content) => (err ? n(err) : y(content))
    )
  })

describe(`transformer-react-doc-gen: onCreateNode`, () => {
  let loadNodeContent, actions, node, createdNodes, updatedNodes
  const createNodeId = jest.fn()
  createNodeId.mockReturnValue(`uuid-from-gatsby`)
  let run = (node, opts = {}) =>
    onCreateNode(
      {
        node,
        loadNodeContent,
        actions,
        createNodeId,
      },
      opts
    )

  beforeEach(() => {
    createdNodes = []
    updatedNodes = []
    node = {
      id: `node_1`,
      children: [],
      internal: {
        mediaType: `application/javascript`,
      },
      __fixture: `classes.js`,
    }
    loadNodeContent = jest.fn(node => readFile(node.__fixture))
    actions = {
      createNode: jest.fn(n => createdNodes.push(n)),
      createParentChildLink: jest.fn(n => updatedNodes.push(n)),
    }
  })

  it(`should only process javascript and jsx nodes`, () => {
    loadNodeContent = jest.fn(() => new Promise(() => {}))

    expect(run({ internal: { mediaType: `text/x-foo` } })).toBeNull()
    expect(
      run({ internal: { mediaType: `application/javascript` } })
    ).toBeDefined()
    expect(run({ internal: { mediaType: `text/jsx` } })).toBeDefined()

    expect(loadNodeContent.mock.calls).toHaveLength(2)
  })

  it(`should extract all components in a file`, async () => {
    await run(node)

    let types = groupBy(createdNodes, n => n.internal.type)
    expect(types.ComponentMetadata).toHaveLength(5)
  })

  it(`should give all components a name`, async () => {
    await run(node)

    let types = groupBy(createdNodes, `internal.type`)
    expect(types.ComponentMetadata.every(c => c.displayName)).toBe(true)
  })

  it(`should infer a name`, async () => {
    node.__fixture = `unnamed.js`
    node.absolutePath = path.join(__dirname, `UnnamedExport`)
    await run(node)

    expect(createdNodes[0].displayName).toEqual(`UnnamedExport`)
  })

  it(`should extract all propTypes`, async () => {
    await run(node)

    let types = groupBy(createdNodes, `internal.type`)
    expect(types.ComponentProp).toHaveLength(14)
  })

  it(`should delicately remove doclets`, async () => {
    await run(node)

    let types = groupBy(createdNodes, `internal.type`)
    expect(types.ComponentProp[0].description).toEqual(
      `An object hash of field (fix this @mention?) errors for the form.`
    )
    expect(types.ComponentProp[0].doclets).toEqual({
      type: `{Foo}`,
      default: `blue`,
    })
  })

  it(`should extract create description nodes with markdown types`, async () => {
    await run(node)
    let types = groupBy(createdNodes, `internal.type`)
    expect(
      types.ComponentDescription.every(
        d => d.internal.mediaType === `text/markdown`
      )
    ).toBe(true)
  })

  it(`should allow specifying handlers`, async () => {
    let handler = jest.fn()
    await run(node, {
      handlers: [handler],
    })

    expect(!!handler.mock.calls.length).toBe(true)
  })

  describe(`flowTypes`, () => {
    beforeEach(() => {
      node.__fixture = `flow.js`
    })
    it(`should add flow type info`, async () => {
      await run(node)
      expect(createdNodes[1].flowType).toEqual({
        name: `number`,
      })
    })
  })
})
