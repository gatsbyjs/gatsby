import fs from "fs"
import { groupBy } from "lodash"
import onCreateNode from "../on-node-create"
import path from "path"

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
        reporter: { error: console.error },
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

  it(`should only process javascript and jsx nodes`, async () => {
    loadNodeContent = jest.fn(() => new Promise(() => {}))

    expect(await run({ internal: { mediaType: `text/x-foo` } })).toBeUndefined()
    expect(
      run({ internal: { mediaType: `application/javascript` } })
    ).toBeDefined()
    expect(run({ internal: { mediaType: `text/jsx` } })).toBeDefined()

    expect(loadNodeContent.mock.calls).toHaveLength(2)
  })

  it(`should extract all components in a file`, async () => {
    await run(node)

    let types = groupBy(createdNodes, n => n.internal.type)
    expect(types.ComponentMetadata).toHaveLength(6)
  })

  it(`should give all components a name`, async () => {
    await run(node)

    let types = groupBy(createdNodes, `internal.type`)

    expect(types.ComponentMetadata.map(c => c.displayName)).toEqual([
      `Baz`,
      `Buz`,
      `Foo`,
      `Baz.Foo`,
      `Bar`,
      `Qux`,
    ])
  })

  it(`should handle duplicate doclet values`, async () => {
    await run(node)

    let Bar = groupBy(createdNodes, `internal.type`).ComponentMetadata.find(
      d => d.displayName === `Bar`
    )

    expect(Bar.doclets.filter(d => d.tag === `property`)).toHaveLength(2)
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
    expect(types.ComponentProp[0].doclets).toEqual([
      { tag: `type`, value: `{Foo}` },
      { tag: `default`, value: `blue` },
    ])
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
      const created = createdNodes.find(f => !!f.flowType)

      expect(created.flowType).toEqual({
        name: `number`,
      })
    })
  })
})
