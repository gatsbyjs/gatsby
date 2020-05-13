const React = require(`react`)

const { render, File, NPMPackage } = require(`.`)

const fixture = (
  <doc>
    <File path="red.js" content="red!" />
    <NPMPackage name="gatsby" />
  </doc>
)

test(`renders to a plan`, async () => {
  const result = await render(fixture, {})

  expect(result).toMatchInlineSnapshot(`
    Object {
      "children": Array [
        Object {
          "children": Array [
            Object {
              "children": Array [
                Object {
                  "text": "{\\"currentState\\":\\"\\",\\"newState\\":\\"red!\\",\\"describe\\":\\"Write red.js\\",\\"diff\\":\\"- Original  - 0/n+ Modified  + 1/n/n+ red!\\"}",
                },
              ],
              "props": Object {
                "children": "{\\"currentState\\":\\"\\",\\"newState\\":\\"red!\\",\\"describe\\":\\"Write red.js\\",\\"diff\\":\\"- Original  - 0/n+ Modified  + 1/n/n+ red!\\"}",
              },
              "type": "File",
            },
            Object {
              "children": Array [
                Object {
                  "text": "{\\"newState\\":\\"gatsby@latest\\",\\"describe\\":\\"Install gatsby@latest\\"}",
                },
              ],
              "props": Object {
                "children": "{\\"newState\\":\\"gatsby@latest\\",\\"describe\\":\\"Install gatsby@latest\\"}",
              },
              "type": "NPMPackage",
            },
          ],
          "props": Object {
            "children": Array [
              <File
                content="red!"
                path="red.js"
              />,
              <NPMPackage
                name="gatsby"
              />,
            ],
          },
          "type": "doc",
        },
      ],
    }
  `)
})
