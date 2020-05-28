const React = require(`react`)

const { render } = require(`./render`)
const { resourceComponents } = require(`./resource-components`)

const { File, NPMPackage } = resourceComponents

const fixture = (
  <doc>
    <File path="red.js" content="red!" />
    <NPMPackage name="gatsby" />
  </doc>
)

test(`handles nested rendering`, async () => {
  const result = await render(
    <doc>
      <File path="red.js" content="red!">
        <File path="blue.js" content="blue!">
          <File path="yellow.js" content="yellow!" />
        </File>
      </File>
    </doc>,
    {}
  )

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "currentState": "",
        "describe": "Write red.js",
        "diff": "- Original  - 0
    + Modified  + 1

    + red!",
        "newState": "red!",
        "resourceChildren": Array [
          Object {
            "currentState": "",
            "describe": "Write blue.js",
            "diff": "- Original  - 0
    + Modified  + 1

    + blue!",
            "newState": "blue!",
            "resourceChildren": Array [
              Object {
                "currentState": "",
                "describe": "Write yellow.js",
                "diff": "- Original  - 0
    + Modified  + 1

    + yellow!",
                "newState": "yellow!",
                "resourceDefinitions": Object {
                  "content": "yellow!",
                  "path": "yellow.js",
                },
                "resourceName": "File",
              },
            ],
            "resourceDefinitions": Object {
              "content": "blue!",
              "path": "blue.js",
            },
            "resourceName": "File",
          },
        ],
        "resourceDefinitions": Object {
          "content": "red!",
          "path": "red.js",
        },
        "resourceName": "File",
      },
    ]
  `)
})

test(`renders to a plan`, async () => {
  const result = await render(fixture, {})

  // Gatsby latest version is ever changing so we use regex matcher for currentState property.
  // Unfortunately jest property matchers work weirdly on arrays so instead
  // of snapshotting entitre result array it's split into few pieces.

  expect(result.length).toEqual(2)
  expect(result[0]).toMatchInlineSnapshot(`
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
    }
  `)
  expect(result[1]).toMatchInlineSnapshot(
    {
      currentState: expect.stringMatching(/gatsby@[0-9.]+/),
    },
    `
    Object {
      "currentState": StringMatching /gatsby@\\[0-9\\.\\]\\+/,
      "describe": "Install gatsby@latest",
      "newState": "gatsby@latest",
      "resourceDefinitions": Object {
        "name": "gatsby",
      },
      "resourceName": "NPMPackage",
    }
  `
  )
})
