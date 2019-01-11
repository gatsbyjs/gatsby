jest.mock(`gatsby-plugin-sharp`, () =>
  [`queueImageResizing`, `base64`, `fluid`, `fixed`, `traceSVG`].reduce(
    (merged, method) => {
      merged[method] = jest.fn()
      return merged
    },
    {}
  )
)
const extendNodeType = require(`../extend-node-type`)
const { fluid, fixed } = require(`gatsby-plugin-sharp`)

describe(`basic behavior`, () => {
  const getArgs = (opts = {}) => {
    const additional = {
      pathPrefix: ``,
      assetPrefix: ``,
      withPathPrefix: jest.fn(),
      ...opts,
    }
    const args = {
      ...additional,
      getNodeAndSavePathDependency: jest.fn(),
      type: {
        name: `ImageSharp`,
      },
    }

    return [extendNodeType(args), additional, args]
  }

  it(`returns empty object if non ImageSharp node`, () => {
    expect(
      extendNodeType({
        type: `MarkdownRemark`,
      })
    ).toEqual({})
  })

  describe(`fluid`, () => {
    it(`forwards arguments to fluid utility`, () => {
      const [{ fluid: fluidImage }, args] = getArgs()

      fluidImage.resolve({ parent: `` }, {}, {})
      expect(fluid).toHaveBeenCalledWith(expect.objectContaining(args))
    })

    it(`invokes getNodeAndSavePathDependency`, () => {
      const [
        { fluid: fluidImage },
        ,
        { getNodeAndSavePathDependency },
      ] = getArgs()

      const image = { parent: `pretend-this-is-a-file-node` }
      const context = { path: process.cwd() }

      fluidImage.resolve(image, {}, context)

      expect(getNodeAndSavePathDependency).toHaveBeenCalledWith(
        image.parent,
        context.path
      )
    })
  })

  describe(`fixed`, () => {
    it(`forward arguments to fixed utility`, () => {
      const [{ fixed: fixedImage }, args] = getArgs()

      fixedImage.resolve({ parent: `` }, {}, {})
      expect(fixed).toHaveBeenCalledWith(expect.objectContaining(args))
    })

    it(`invokes getNodeAndSavePathDependency`, () => {
      const [
        { fixed: fixedImage },
        ,
        { getNodeAndSavePathDependency },
      ] = getArgs()

      const image = { parent: `pretend-this-is-a-file-node` }
      const context = { path: process.cwd() }

      fixedImage.resolve(image, {}, context)

      expect(getNodeAndSavePathDependency).toHaveBeenCalledWith(
        image.parent,
        context.path
      )
    })
  })
})
