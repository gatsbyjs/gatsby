import { sanitizeNode } from "../sanitize-node"

describe(`node sanitization`, () => {
  let testNode

  beforeEach(() => {
    const circularReference = {}
    // @ts-ignore edge test case
    circularReference.self = circularReference
    const indirectCircular = {
      down1: {
        down2: {},
      },
    }
    //  @ts-ignore edge test case
    indirectCircular.down1.down2.deepCircular = indirectCircular

    testNode = {
      id: `id1`,
      parent: null,
      children: [],
      unsupported: (): void => {},
      inlineObject: {
        field: `fieldOfFirstNode`,
        re: /re/,
      },
      repeat: `foo`,
      repeat2: `bar`,
      repeat3: {
        repeat3: {
          test: (): void => {},
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
    // @ts-ignore test properties that shouldn't be there are not there
    expect(result.unsupported).not.toBeDefined()
    // @ts-ignore test properties that shouldn't be there are not there
    expect(result.inlineObject.re).not.toBeDefined()
    // @ts-ignore test properties that shouldn't be there are not there
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
      parent: ``,
      children: [],
      inlineObject: {
        field: `fieldOfFirstNode`,
      },
      inlineArray: [1, 2, 3],
      internal: {
        type: `Test`,
        contentDigest: `digest1`,
        owner: `test`,
        counter: 0,
      },
      fields: [],
    }

    const result = sanitizeNode(testNodeWithoutUnserializableData)
    // should be same instance
    expect(result).toBe(testNodeWithoutUnserializableData)
  })

  it(`keeps length field but not OOM`, () => {
    const testNodeWithLength = {
      id: `id2`,
      parent: ``,
      children: [],
      length: 81185414,
      foo: `bar`,
      internal: {
        type: `Test`,
        contentDigest: `digest1`,
        owner: `test`,
        counter: 0,
      },
      fields: [],
    }
    const result = sanitizeNode(testNodeWithLength)
    // @ts-ignore - Just for tests
    expect(result.length).toBeDefined()
  })
})
