const sanitizeNode = require(`../sanitize-node`)

describe(`node sanitization`, () => {
  let testNode

  beforeEach(() => {
    const circularReference = {}
    circularReference.self = circularReference
    const indirectCircular = {
      down1: {
        down2: {},
      },
    }
    indirectCircular.down1.down2.deepCircular = indirectCircular

    testNode = {
      id: `id1`,
      parent: null,
      children: [],
      unsupported: () => {},
      inlineObject: {
        field: `fieldOfFirstNode`,
        re: /re/,
      },
      repeat: `foo`,
      repeat2: `bar`,
      repeat3: {
        repeat3: {
          test: () => {},
          repeat: `bar`,
        },
      },
      inlineArray: [1, 2, 3, Symbol(`test`)],
      internal: {
        type: `Test`,
        contentDigest: `digest1`,
        owner: `test`,
      },
      circularReference,
      deep: {
        indirectCircular,
      },
    }
  })

  it(`Remove not supported fields / values`, () => {
    const result = sanitizeNode(testNode)
    expect(result).toMatchSnapshot()
    expect(result.unsupported).not.toBeDefined()
    expect(result.inlineObject.re).not.toBeDefined()
    expect(result.inlineArray[3]).not.toBeDefined()
  })

  it(`Doesn't mutate original`, () => {
    sanitizeNode(testNode)
    expect(testNode.unsupported).toBeDefined()
    expect(testNode.inlineObject.re).toBeDefined()
    expect(testNode.inlineArray[3]).toBeDefined()
  })

  it(`Create copy of node if it has to remove anything`, () => {
    const result = sanitizeNode(testNode)
    expect(result).not.toBe(testNode)
  })

  it(`Doesn't create clones if it doesn't have to`, () => {
    const testNodeWithoutUnserializableData = {
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
        owner: `test`,
      },
    }

    const result = sanitizeNode(testNodeWithoutUnserializableData)
    // should be same instance
    expect(result).toBe(testNodeWithoutUnserializableData)
  })
})
