const mdxLoader = require(`./mdx-loader`)
const prettier = require(`prettier`)
const { BaseN } = require(`js-combinatorics/commonjs/combinatorics`)

function genMDXFile(input) {
  const code = {
    frontmatter: `---
one: two
three: 4
array: [1,2,3]
---`,
    defaultLayout: `export default ({children, ...props}) => (
<div>
{children}
</div>
)`,
    namedExports: `export const meta = {author: "chris"}`,
    body: `# Some title

a bit of a paragraph

some content`,
  }

  return {
    name:
      Object.entries(input)
        .filter(([k, v]) => !!v) // eslint-disable-line no-unused-vars
        .map(([k, v]) => k) // eslint-disable-line no-unused-vars
        .join(`-`) || `body`,
    content: [
      input.frontmatter ? code.frontmatter : ``,
      input.layout ? code.defaultLayout : ``,
      input.namedExports ? code.namedExports : ``,
      code.body,
    ].join(`\n\n`),
    isDevelopStage: input.isDevelopStage,
    lessBabel: input.lessBabel,
  }
}

// generate a table of all possible combinations of genMDXfile input
const fixtures = new BaseN([true, false], 5)
  .toArray()
  .map(([frontmatter, layout, namedExports, isDevelopStage, lessBabel]) =>
    genMDXFile({ frontmatter, layout, namedExports, isDevelopStage, lessBabel })
  )
  .map(({ name, content, isDevelopStage, lessBabel }) => [
    name,
    {
      internal: { type: `File` },
      sourceInstanceName: `webpack-test-fixtures`,
      absolutePath: `/fake/${name}`,
    },
    content,
    isDevelopStage,
    lessBabel,
  ])

describe(`mdx-loader`, () => {
  expect.addSnapshotSerializer({
    print(val /* , serialize */) {
      return prettier.format(val, { parser: `babel` })
    },
    test() {
      return true
    },
  })
  test.each(fixtures)(
    `snapshot with %s`,
    async (filename, fakeGatsbyNode, content, isDevelopStage, lessBabel) => {
      let err
      let result

      const createLoader = (opts = {}) =>
        mdxLoader.bind({
          async() {
            return (_err, _result) => {
              err = _err
              result = _result
            }
          },
          query: {
            getNodes(_type) {
              return fixtures.map(([, node]) => node)
            },
            getNodesByType(_type) {
              return fixtures.map(([, node]) => node)
            },
            pluginOptions: {
              lessBabel,
            },
            cache: {
              get() {
                return false
              },
              set() {
                return
              },
            },
            isolateMDXComponent: isDevelopStage,
          },
          resourcePath: fakeGatsbyNode.absolutePath,
          resourceQuery: fakeGatsbyNode.absolutePath,
          rootContext: `/fake/`,
          ...opts,
        })

      await createLoader()(content)
      expect(err).toBeNull()
      expect(result).toMatchSnapshot()
      err = result = undefined

      if (isDevelopStage) {
        await createLoader({
          resourceQuery: `${fakeGatsbyNode.absolutePath}?type=component`,
        })(content)
        expect(err).toBeNull()
        expect(result).toMatchSnapshot()
      }
    }
  )
})
