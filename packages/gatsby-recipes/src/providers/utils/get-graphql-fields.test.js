const getFields = require(`./get-graphql-fields`)

const options = {
  metadata: [`type`, `title`],
}

const fixture = `
  type BlogPost {
    title: String
    body: String @metadata(type: "Text", title: "Content")
  }
`

test(`get-graphql-fields returns an array of fields`, () => {
  const result = getFields(fixture, options)

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "fields": Object {
          "body": Object {
            "metadata": Object {
              "title": "Content",
              "type": "Text",
            },
            "type": "String",
          },
          "title": Object {
            "metadata": undefined,
            "type": "String",
          },
        },
        "name": "BlogPost",
      },
    ]
  `)
})
