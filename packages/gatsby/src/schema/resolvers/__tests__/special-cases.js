const withSpecialCases = require(`../special-cases`)

const { getById } = require(`../../db`)
jest.mock(`../../db`, () => {
  const { trackObjects } = require(`../../utils/node-tracking`)
  const nodes = [
    { id: 1, internal: { type: `File` }, dir: `/home` },
    { id: 2, internal: { type: `Foo` }, parent: 1 },
    { id: 3, internal: { type: `File` }, absolutePath: `/foo/bar.baz` },
    { id: 4, internal: { type: `Foo` }, parent: 3 },
  ]
  nodes.forEach(trackObjects)
  return {
    getById: id => nodes.find(node => node.id === id),
  }
})

describe(`Resolver special cases`, () => {
  describe(`File nodes`, () => {
    const type = `File`
    const source = getById(2)
    const args = { filter: { relativePath: { eq: `../foo/bar.baz` } } }
    const info = {}

    it(`resolves relative path to absolute path derived from parent node`, () => {
      const queryArgs = withSpecialCases({ type, source, args, info })
      expect(queryArgs.filter.relativePath).toBeUndefined()
      expect(queryArgs.filter.absolutePath).toEqual({ eq: `/foo/bar.baz` })
    })

    it(`resolves relative path to absolute path derived from page`, () => {
      const info = { parentType: { name: `Query` } }
      const context = { path: `/home` }
      const queryArgs = withSpecialCases({ type, source, args, context, info })
      expect(queryArgs.filter.relativePath).toBeUndefined()
      expect(queryArgs.filter.absolutePath).toEqual({ eq: `/foo/bar.baz` })
    })

    it(`resolves relative path to absolute path derived from component`, () => {
      const info = { parentType: { name: `Query` } }
      const source = { componentPath: `/home` }
      const queryArgs = withSpecialCases({ type, source, args, info })
      expect(queryArgs.filter.relativePath).toBeUndefined()
      expect(queryArgs.filter.absolutePath).toEqual({ eq: `/foo/bar.baz` })
    })

    it(`handles multiple paths`, () => {
      const args = {
        filter: { relativePath: { eq: [`../qux/bar.baz`, `../foo/bar.baz`] } },
      }
      const queryArgs = withSpecialCases({ type, source, args, info })
      expect(queryArgs.filter.absolutePath).toEqual({
        eq: [`/qux/bar.baz`, `/foo/bar.baz`],
      })
    })

    it(`preserves query operators`, () => {
      const args = { filter: { relativePath: { in: [`../foo/bar.baz`] } } }
      const queryArgs = withSpecialCases({ type, source, args, info })
      expect(queryArgs.filter.absolutePath).toEqual({ in: [`/foo/bar.baz`] })
    })

    it(`keeps unmodified relativePath when base dir cannot be determined`, () => {
      const source = getById(4)
      const args = { filter: { relativePath: { eq: `../foo/bar.baz` } } }
      const queryArgs = withSpecialCases({ type, source, args, info })
      expect(queryArgs.filter.relativePath).toEqual({ eq: `../foo/bar.baz` })
      expect(queryArgs.filter.absolutePath).toBeUndefined()
    })
  })
})
