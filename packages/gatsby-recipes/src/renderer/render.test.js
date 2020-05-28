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
