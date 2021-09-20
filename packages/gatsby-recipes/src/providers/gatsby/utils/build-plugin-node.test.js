import generate from "@babel/generator"

import buildPluginNode from "./build-plugin-node"

const testPluginNode = obj => {
  const ast = buildPluginNode(obj)

  return generate(ast).code
}

test(`build-plugin-node creates a proper AST from JSON object`, () => {
  const result = testPluginNode({
    name: `gatsby-plugin-foo`,
    key: `super-special`,
    options: {
      foo: `bar`,
    },
  })

  expect(result).toMatchInlineSnapshot(`
    "{
      resolve: 'gatsby-plugin-foo',
      options: {
        \\"foo\\": \\"bar\\"
      },
      __key: \\"super-special\\"
    }"
  `)
})

test(`build-plugin-node does not add a key when it doesn't exist`, () => {
  const result = testPluginNode({
    name: `gatsby-plugin-foo`,
    options: {
      foo: `bar`,
    },
  })

  expect(result).toMatchInlineSnapshot(`
    "{
      resolve: 'gatsby-plugin-foo',
      options: {
        \\"foo\\": \\"bar\\"
      }
    }"
  `)
})

test(`build-plugin-node returns a string literal when there are no options or key`, () => {
  const result = testPluginNode({
    name: `gatsby-plugin-foo`,
  })

  expect(result).toMatchInlineSnapshot(`"\\"gatsby-plugin-foo\\""`)
})
