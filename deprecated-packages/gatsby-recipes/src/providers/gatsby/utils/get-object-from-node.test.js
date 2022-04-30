import template from "@babel/template"

import getObjectFromNode from "./get-object-from-node"

const buildFixture = () => {
  const ast = template(`
    const foo = {
      foo: \`bar\`,
      "baz": 123,
      "qux": [
        {
          foo: 'bar'
        },
        'baz',
        12.34
      ]
    }
  `)()

  return ast.declarations[0].init
}

test(`get-object-from-node return object from AST node`, () => {
  const result = getObjectFromNode(buildFixture())

  expect(result).toMatchInlineSnapshot(`
    Object {
      "baz": 123,
      "foo": "bar",
      "qux": Array [
        Object {
          "foo": "bar",
        },
        "baz",
        12.34,
      ],
    }
  `)
})
