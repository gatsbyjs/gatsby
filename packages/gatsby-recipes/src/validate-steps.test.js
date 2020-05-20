const validateSteps = require(`./validate-steps`)
const parser = require(`./parser`)

const getErrors = async mdx => {
  const { commands } = await parser.parse(mdx)
  return validateSteps(commands)
}

test(`raises a validation error if commands are in step 0`, async () => {
  const result = await getErrors(`<NPMScript name="foo" command="bar" />`)

  expect(result).toHaveLength(1)
})

test(`does not raise a validation error if Config is in step 0`, async () => {
  const result = await getErrors(`<Config name="foo" />`)

  expect(result).toHaveLength(0)
})
