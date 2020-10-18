import fs from "fs-extra"
import resourceSchema from "../resource-schema"
import Joi from "@hapi/joi"
jest.mock(`fs-extra`)
jest.mock(`node-fetch`, () => require(`fetch-mock-jest`).sandbox())
const fetchMock = require(`node-fetch`)

const file = require(`./file`)

const root = __dirname
const content = `Hello, world!`
const url = `http://example.com/file1.txt`
const url2 = `http://example.com/file2.txt`

const response1 = `query {
  allGatsbyPlugin {
    nodes {
      name
      options
      resolvedOptions
      package {
        version
      }
      ... on GatsbyTheme {
        files {
          nodes {
            path
          }
        }
        shadowedFiles {
          nodes {
            path
          }
        }
      }
    }
  }  
}`
const response2 = `const options = {
  key: process.env.WHATEVER
  
}`

describe(`file resource`, () => {
  test(`e2e file resource test`, async () => {
    const context = { root }
    const initialObject = { path: `file.txt`, content }
    const partialUpdate = { content: content + `1` }
    fs.readFile.mockReturnValue(initialObject.content)

    const createPlan = await file.plan(context, initialObject)

    expect(createPlan).toMatchInlineSnapshot(`
      Object {
        "currentState": "Hello, world!",
        "describe": "Write file.txt",
        "diff": "",
        "newState": "Hello, world!",
      }
    `)

    // Test creating the resource
    const createResponse = await file.create(context, initialObject)
    const validateResult = Joi.validate(createResponse, {
      ...file.schema,
      ...resourceSchema,
    })
    expect(validateResult.error).toBeNull()

    expect(createResponse).toMatchInlineSnapshot(`
      Object {
        "_message": "Wrote file file.txt",
        "content": "Hello, world!",
        "id": "file.txt",
        "path": "file.txt",
      }
    `)

    // Test reading the resource
    const readResponse = await file.read(context, createResponse.id)
    expect(readResponse).toEqual(createResponse)

    // Test updating the resource
    const updatedResource = { ...readResponse, ...partialUpdate }
    const updatePlan = await file.plan(context, updatedResource)
    expect(updatePlan).toMatchInlineSnapshot(`
      Object {
        "currentState": "Hello, world!",
        "describe": "Write file.txt",
        "diff": "- Original  - 1
      + Modified  + 1

      - Hello, world!
      + Hello, world!1",
        "newState": "Hello, world!1",
      }
    `)
    fs.readFile.mockReturnValueOnce(partialUpdate.content)

    const updateResponse = await file.update(context, updatedResource)

    expect(updateResponse).toMatchInlineSnapshot(`
      Object {
        "_message": "Wrote file file.txt",
        "content": "Hello, world!1",
        "id": "file.txt",
        "path": "file.txt",
      }
    `)

    await file.destroy(context, updateResponse)
  })
  test(`e2e remote file resource test`, async () => {
    const context = { root }

    const initialObject = { path: `file.txt`, content: url }
    const partialUpdate = { content: url2 }
    fs.readFile.mockReturnValue(response1)
    const { Readable, PassThrough } = require(`stream`)

    fs.createWriteStream.mockImplementation(() => new PassThrough())

    fetchMock
      .get(
        url,
        () => {
          const readable = new Readable()

          readable.push(response1)
          readable.push(null)

          return readable
        },
        { sendAsJson: false }
      )
      .mock(url2, response2)

    fs.readFile.mockReturnValueOnce(``)
    const createPlan = await file.plan(context, initialObject)

    expect(createPlan.currentState).toEqual(``)
    expect(createPlan.newState).toEqual(response1)

    // Test creating the resource
    const createResponse = await file.create(context, initialObject)
    const validateResult = Joi.validate(createResponse, {
      ...file.schema,
      ...resourceSchema,
    })
    expect(validateResult.error).toBeNull()

    expect(createResponse.content).toEqual(response1)

    // Test reading the resource
    const readResponse = await file.read(context, createResponse.id)
    expect(readResponse).toEqual(createResponse)

    // Test updating the resource
    const updatedResource = { ...readResponse, ...partialUpdate }
    const updatePlan = await file.plan(context, updatedResource)
    expect(updatePlan.diff).toMatchInlineSnapshot(`
      "- Original  - 23
      + Modified  +  3

      - query {
      -   allGatsbyPlugin {
      -     nodes {
      -       name
      -       options
      -       resolvedOptions
      -       package {
      -         version
      -       }
      -       ... on GatsbyTheme {
      -         files {
      -           nodes {
      -             path
      -           }
      -         }
      -         shadowedFiles {
      -           nodes {
      -             path
      -           }
      -         }
      -       }
      -     }
      -   }  
      + const options = {
      +   key: process.env.WHATEVER
      +   
        }"
    `)
    fs.readFile.mockReturnValueOnce(partialUpdate.content)

    const updateResponse = await file.update(context, updatedResource)

    expect(updateResponse).toMatchInlineSnapshot(`
      Object {
        "_message": "Wrote file file.txt",
        "content": "http://example.com/file2.txt",
        "id": "file.txt",
        "path": "file.txt",
      }
    `)

    await file.destroy(context, updateResponse)
  })
})
