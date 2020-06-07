const resourceSchema = require(`./resource-schema`)
const Joi = require(`@hapi/joi`)

module.exports = async ({
  resourceModule: resource,
  context,
  resourceName,
  initialObject,
  partialUpdate,
}) => {
  // Test the plan
  const createPlan = await resource.plan(context, initialObject)
  expect(createPlan).toBeTruthy()

  expect(createPlan).toMatchSnapshot(`${resourceName} create plan`)

  // Test creating the resource
  const createResponse = await resource.create(context, initialObject)
  const validateResult = Joi.validate(createResponse, {
    ...resource.schema,
    ...resourceSchema,
  })
  expect(validateResult.error).toBeNull()
  expect(createResponse).toMatchSnapshot(`${resourceName} create`)

  // Test reading the resource
  const readResponse = await resource.read(context, createResponse.id)
  expect(readResponse).toEqual(createResponse)

  // Test updating the resource
  const updatedResource = { ...readResponse, ...partialUpdate }
  const updatePlan = await resource.plan(context, updatedResource)
  expect(updatePlan).toMatchSnapshot(`${resourceName} update plan`)

  const updateResponse = await resource.update(context, updatedResource)
  expect(updateResponse).toMatchSnapshot(`${resourceName} update`)

  // Test destroying the resource.
  // TODO: Read resource, destroy it, and return thing that's destroyed
  const destroyReponse = await resource.destroy(context, updateResponse)
  expect(destroyReponse).toMatchSnapshot(`${resourceName} destroy`)

  // Ensure that resource was destroyed
  const postDestroyReadResponse = await resource.read(
    context,
    createResponse.id
  )
  expect(postDestroyReadResponse).toBeUndefined()
}
