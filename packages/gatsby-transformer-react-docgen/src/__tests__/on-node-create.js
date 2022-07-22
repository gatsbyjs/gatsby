import fs from "fs"
import { groupBy } from "lodash"
import { onCreateNode } from "../on-node-create"
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
  let loadNodeContent
  let actions
  let node
  let createdNodes
  let updatedNodes
  const createNodeId = jest.fn()
  let i

  beforeAll(() => {
    i = 0
    createNodeId.mockImplementation(() => i++)
  })

  const run = (node, opts = {}) => {
    const createContentDigest = jest.fn().mockReturnValue(`contentDigest`)
    return onCreateNode(
      {
        node,
        loadNodeContent,
        actions,
        createNodeId,
        reporter: { error: console.error },
        createContentDigest,
      },
      { cwd: path.join(__dirname, `fixtures`), ...opts }
    )
  }

  let consoleError
  beforeEach(() => {
    consoleError = global.console.error
    global.console.error = jest.fn()
    createdNodes = []
    updatedNodes = []
    node = {
      id: `node_1`,
      children: [],
      internal: {
        mediaType: `application/javascript`,
      },
      get absolutePath() {
        return path.join(__dirname, `fixtures`, this.__fixture)
      },
      __fixture: `classes.js`,
    }
    loadNodeContent = jest.fn(node => readFile(node.__fixture))
    actions = {
      createNode: jest.fn(n => createdNodes.push(n)),
      createParentChildLink: jest.fn(n => updatedNodes.push(n)),
    }
  })

  afterAll(() => {
    global.console.error = consoleError
  })

  it(`should only process javascript, jsx, and typescript nodes`, async () => {
    loadNodeContent = jest.fn().mockResolvedValue(``)

    const unknown = [
      null,
      { internal: { mediaType: `text/x-foo` } },
      { internal: { mediaType: `text/markdown` } },
    ]

    const expected = [
      { internal: { mediaType: `application/javascript` } },
      { internal: { mediaType: `text/jsx` } },
      { internal: { mediaType: `text/tsx` } },
      { internal: {}, extension: `tsx` },
      { internal: {}, extension: `ts` },
    ]

    await Promise.all(
      []
        .concat(unknown)
        .concat(expected)
        .map(node => run(node))
    )

    expect(loadNodeContent).toHaveBeenCalledTimes(expected.length)
  })

  it(`should extract all components in a file`, async () => {
    await run(node)

    const types = groupBy(createdNodes, n => n.internal.type)
    expect(types.ComponentMetadata).toHaveLength(6)
  })

  it(`should give all components a name`, async () => {
    await run(node)

    const types = groupBy(createdNodes, `internal.type`)

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

    const Bar = groupBy(createdNodes, `internal.type`).ComponentMetadata.find(
      d => d.displayName === `Bar`
    )

    expect(Bar.doclets.filter(d => d.tag === `property`)).toHaveLength(2)
  })

  it(`should infer a name`, async () => {
    node.__fixture = `unnamed.js`

    await run(node)

    expect(
      groupBy(createdNodes, `internal.type`).ComponentMetadata[0].displayName
    ).toEqual(`Unnamed`)
  })

  it(`should create a description node when there is no description`, async () => {
    node.__fixture = `unnamed.js`

    await run(node)

    expect(
      groupBy(createdNodes, `internal.type`).ComponentDescription
    ).toHaveLength(1)
  })

  it(`should extract all propTypes`, async () => {
    await run(node)

    const types = groupBy(createdNodes, `internal.type`)
    expect(types.ComponentProp).toHaveLength(14)
  })

  it(`should delicately remove doclets`, async () => {
    await run(node)

    const types = groupBy(createdNodes, `internal.type`)

    const id = types.ComponentProp[0].id

    expect(types.ComponentProp[0].doclets).toEqual([
      { tag: `type`, value: `{Foo}` },
      { tag: `default`, value: `blue` },
    ])

    expect(types.ComponentDescription.find(d => d.parent === id).text).toEqual(
      `An object hash of field (fix this @mention?) errors for the form.`
    )
  })

  it(`should extract create description nodes with markdown types`, async () => {
    await run(node)
    const types = groupBy(createdNodes, `internal.type`)
    expect(
      types.ComponentDescription.every(
        d => d.internal.mediaType === `text/markdown`
      )
    ).toBe(true)
  })

  it(`should allow specifying handlers`, async () => {
    const handler = jest.fn()
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

      const created = createdNodes.map(f => f.flowType).filter(Boolean)

      expect(created).toMatchSnapshot(`flow types`)
    })
    it(`literalsAndUnion property should be union type`, async () => {
      await run(node)
      const created = createdNodes.find(f => f.name === `literalsAndUnion`)

      expect(created.flowType).toEqual(
        expect.objectContaining({
          name: `union`,
          raw: `"string" | "otherstring" | number`,
        })
      )
    })

    it(`badDocumented property should flowType ReactNode`, async () => {
      await run(node)
      const created = createdNodes.find(f => f.name === `badDocumented`)

      expect(created.flowType).toEqual(
        expect.objectContaining({
          name: `ReactNode`,
        })
      )
    })
  })

  describe(`tsTypes`, () => {
    beforeEach(() => {
      node.__fixture = `typescript.tsx`
    })

    it(`should add TS type info`, async () => {
      await run(node, {
        parserOpts: {
          plugins: [`jsx`, `typescript`, `classProperties`],
        },
      })

      const created = createdNodes.map(f => f.tsType).filter(Boolean)

      expect(created).toMatchSnapshot(`typescript types`)
    })
  })
})
