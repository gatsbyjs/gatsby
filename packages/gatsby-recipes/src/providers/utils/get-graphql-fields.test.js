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
        "fields": Array [
          Object {
            "id": "title",
            "name": "title",
            "type": "String",
          },
          Object {
            "id": "body",
            "name": "body",
            "title": "Content",
            "type": "Text",
          },
        ],
        "name": "BlogPost",
      },
    ]
  `)
})
