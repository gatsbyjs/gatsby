const React = require(`react`)

const { render } = require(`./render`)
const { File, NPMPackage } = require(`./resource-components`)

const fixture = (
  <doc>
    <File path="red.js" content="red!" />
    <NPMPackage name="gatsby" />
  </doc>
)

test(`renders to a plan`, async () => {
  const result = await render(fixture, {})

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "currentState": "",
        "describe": "Write red.js",
        "diff": "- Original  - 0
    + Modified  + 1

    + red!",
        "newState": "red!",
        "resourceDefinitions": Object {
          "content": "red!",
          "path": "red.js",
        },
        "resourceName": "File",
      },
      Object {
        "currentState": "gatsby@2.22.5",
        "describe": "Install gatsby@latest",
        "newState": "gatsby@latest",
        "resourceDefinitions": Object {
          "name": "gatsby",
        },
        "resourceName": "NPMPackage",
      },
    ]
  `)
})
