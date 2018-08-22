const extendNodeType = require(`../extend-node-type`)
const { __DEFAULT_QUALITY__ } = extendNodeType

const getOptions = (options = {}) => {return {
  type: {
    name: `ImageSharp`,
  },
  pathPrefix: `/`,
  getNodeAndSavePathDependency: jest.fn(),
  reporter: jest.fn(),
  ...options,
}}

describe(`basic functionality`, () => {
  it(`returns empty object if not ImageSharp type`, () => {
    const options = getOptions({ type: `MarkdownRemark` })

    expect(extendNodeType(options)).toEqual({})
  })

  it(`returns expected image operations`, () => {
    const expected = [`fixed`, `resolutions`, `fluid`, `sizes`, `original`, `resize`]
      .reduce((merged, key) => {
        merged[key] = expect.any(Object)
        return merged
      }, {})
        
    expect(extendNodeType(getOptions())).toEqual(expected)
  })
})

describe(`quality`, () => {
  const options = getOptions()

  it(`uses fallback quality if not passed`, () => {
    const node = extendNodeType(options);

    [node.fixed, node.fluid]
      .forEach(type => {
        expect(type.args.quality.defaultValue).toBe(__DEFAULT_QUALITY__)
      })
  })

  it(`allows for configuration of quality`, () => {
    const defaultQuality = 100
    const node = extendNodeType(options, { defaultQuality });

    [node.fixed, node.fluid]
      .forEach(type => {
        expect(type.args.quality.defaultValue).toBe(defaultQuality)
      })
  })
})
