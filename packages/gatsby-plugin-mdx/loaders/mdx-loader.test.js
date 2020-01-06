const mdxLoader = require(`./mdx-loader`)
const prettier = require(`prettier`)
const c = require(`js-combinatorics`)

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
  }
}

// generate a table of all possible combinations of genMDXfile input
const fixtures = c
  .baseN([true, false], 3)
  .toArray()
  .map(([frontmatter, layout, namedExports]) =>
    genMDXFile({ frontmatter, layout, namedExports })
  )
  .map(({ name, content }) => [
    name,
    {
      internal: { type: `File` },
      sourceInstanceName: `webpack-test-fixtures`,
      absolutePath: `/fake/${name}`,
    },
    content,
  ])

describe(`mdx-loader`, () => {
  expect.addSnapshotSerializer({
    print(val /*, serialize */) {
      return prettier.format(val, { parser: `babel` })
    },
    test() {
      return true
    },
  })
  test.each(fixtures)(
    `snapshot with %s`,
    async (filename, fakeGatsbyNode, content) => {
      const loader = mdxLoader.bind({
        async() {
          return (err, result) => {
            expect(err).toBeNull()
            expect(result).toMatchSnapshot()
          }
        },
        query: {
          getNodes() {
            return fixtures.map(([, node]) => node)
          },
          pluginOptions: {},
          cache: {
            get() {
              return false
            },
            set() {
              return
            },
          },
        },
        resourcePath: fakeGatsbyNode.absolutePath,
      })
      await loader(content)
    }
  )
})
