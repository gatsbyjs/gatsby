import React from "react"

import { render } from "./render"
import { resourceComponents } from "./resource-components"
import { RecipeStep } from "./step-component"
import { InputProvider } from "./input-provider"

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
        "_stepMetadata": Object {},
        "currentState": "",
        "describe": "Write red.js",
        "diff": "- Original  - 0
    + Modified  + 1

    + red!",
        "newState": "red!",
        "resourceChildren": Array [
          Object {
            "_stepMetadata": Object {},
            "currentState": "",
            "describe": "Write blue.js",
            "diff": "- Original  - 0
    + Modified  + 1

    + blue!",
            "newState": "blue!",
            "resourceChildren": Array [
              Object {
                "_stepMetadata": Object {},
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

// test(`overrides inputs when passed`, async () => {
// const result = await render(
// <InputProvider value={{ abc123: { path: `yellow.js` } }}>
// <doc>
// <RecipeStep step={1} totalSteps={2}>
// <File path="red.js" content="red!" _uuid="abc123" />
// </RecipeStep>
// <RecipeStep step={2} totalSteps={2}>
// <File path="blue.js" content="blue!" />
// </RecipeStep>
// </doc>
// </InputProvider>
// )

// expect(result[0].describe).toEqual(`Write yellow.js`)
// expect(result[1].describe).toEqual(`Write blue.js`)
// })

test(`includes step metadata`, async () => {
  const result = await render(
    <doc>
      <RecipeStep step={1} totalSteps={2}>
        <File path="red.js" content="red!" />
      </RecipeStep>
      <RecipeStep step={2} totalSteps={2}>
        <File path="blue.js" content="blue!" />
      </RecipeStep>
    </doc>
  )

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "_stepMetadata": Object {
          "step": 1,
          "totalSteps": 2,
        },
        "currentState": "",
        "describe": "Write red.js",
        "diff": "[31m- Original  - 0[39m
    [32m+ Modified  + 1[39m

    [32m+ red![39m",
        "newState": "red!",
        "resourceDefinitions": Object {
          "content": "red!",
          "path": "red.js",
        },
        "resourceName": undefined,
      },
      Object {
        "_stepMetadata": Object {
          "step": 2,
          "totalSteps": 2,
        },
        "currentState": "",
        "describe": "Write blue.js",
        "diff": "[31m- Original  - 0[39m
    [32m+ Modified  + 1[39m

    [32m+ blue![39m",
        "newState": "blue!",
        "resourceDefinitions": Object {
          "content": "blue!",
          "path": "blue.js",
        },
        "resourceName": undefined,
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
      "_stepMetadata": Object {},
      "currentState": "",
      "describe": "Write red.js",
      "diff": "[31m- Original  - 0[39m
    [32m+ Modified  + 1[39m

    [32m+ red![39m",
      "newState": "red!",
      "resourceDefinitions": Object {
        "content": "red!",
        "path": "red.js",
      },
      "resourceName": undefined,
    }
  `)
  expect(result[1]).toMatchInlineSnapshot(`
    Object {
      "_stepMetadata": Object {},
      "currentState": "gatsby@2.24.7",
      "describe": "Install gatsby@latest",
      "newState": "gatsby@latest",
      "resourceDefinitions": Object {
        "name": "gatsby",
      },
      "resourceName": undefined,
    }
  `)
})
