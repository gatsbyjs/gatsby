import Ajv from "ajv"

const ajv = new Ajv({
  allErrors: true,
})

export const validateOptionsSchema = async (
  // NOTE(@mxstbr): currently unused but will be used to cache compiled schemas for performance
  pluginName: string,
  pluginSchema: object,
  pluginOptions: object
): Promise<boolean> => {
  const validate = ajv.compile(pluginSchema)

  const valid = validate(pluginOptions)

  return valid
}
