import directory from "./directory"
import resourceSchema from "../resource-schema"
import Joi from "@hapi/joi"
import fs from "fs-extra"
import path from "path"
jest.mock(`fs-extra`)

const root = `fakeDir`

describe(`directory resource`, () => {
  test(`e2e directory resource test`, async () => {
    const context = { root }
    const initialObject = { path: `directory` }
    const partialUpdate = { path: `directory1` }

    const fullPath = path.join(root, initialObject.path)

    const createPlan = await directory.plan(context, initialObject)
    expect(createPlan).toBeTruthy()

    expect(createPlan).toMatchInlineSnapshot(`
      Object {
        "describe": "Create directory \\"directory\\"",
      }
    `)

    // Test creating the resource
    const createResponse = await directory.create(context, initialObject)
    const validateResult = Joi.validate(createResponse, {
      ...directory.schema,
      ...resourceSchema,
    })
    expect(validateResult.error).toBeNull()
    expect(fs.ensureDir).toHaveBeenCalledWith(fullPath)

    expect(createResponse).toMatchInlineSnapshot(`
      Object {
        "_message": "Created directory \\"directory\\"",
        "id": "directory",
        "path": "directory",
      }
    `)

    // Test reading the resource
    const readResponse = await directory.read(context, createResponse.id)
    expect(readResponse).toEqual(createResponse)

    // Test updating the resource
    const updatedResource = { ...readResponse, ...partialUpdate }
    const updatePlan = await directory.plan(context, updatedResource)
    expect(updatePlan).toMatchInlineSnapshot(`
      Object {
        "describe": "Create directory \\"directory1\\"",
      }
    `)

    fs.ensureDir.mockReset()
    const updateResponse = await directory.update(context, updatedResource)
    expect(fs.ensureDir).toHaveBeenCalledWith(fullPath)

    await directory.destroy(context, updateResponse)
    expect(fs.rmdir).toHaveBeenCalledWith(fullPath)
  })
})
