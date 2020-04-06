const resourceSchema = require(`./resource-schema`)
const Joi = require(`joi`)

module.exports = async ({
  resourceModule: resource,
  context,
  resourceName,
  initialObject,
  partialUpdate,
}) => {
  // Test the plan
  const createPlan = await resource.plan(context, initialObject)
  expect(createPlan).toMatchSnapshot()

  // Test creating the resource
  const createResponse = await resource.create(context, initialObject)
  const validateResult = Joi.validate(createResponse, {
    ...resource.validate(),
    ...resourceSchema,
  })
  expect(validateResult.error).toBeNull()
  expect(createResponse).toMatchSnapshot()

  // Test reading the resource
  const readResponse = await resource.read(context, createResponse.id)
  expect(readResponse).toEqual(createResponse)

  // Test updating the resource
  const updatedResource = { ...readResponse, ...partialUpdate }
  const updatePlan = await resource.plan(context, updatedResource)
  expect(updatePlan).toMatchSnapshot()

  const updateResponse = await resource.update(context, updatedResource)
  expect(updateResponse).toMatchSnapshot()

  // Test destroying the resource.
  const destroyReponse = await resource.destroy(context, updateResponse)
  expect(destroyReponse).toMatchSnapshot()
}
