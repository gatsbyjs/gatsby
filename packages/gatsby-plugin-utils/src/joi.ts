import joi from "joi"
import { SchemaMap } from "joi"
import { ObjectSchema, PluginOptionsSchemaJoi } from "./utils/plugin-options-schema-joi-type"

const joiInstance: PluginOptionsSchemaJoi = joi.extend({
  // This tells Joi to extend _all_ types with .dotenv(), see
  // https://github.com/sideway/joi/commit/03adf22eb1f06c47d1583617093edee3a96b3873
  // @ts-ignore Joi types weren't updated with that commit, PR: https://github.com/sideway/joi/pull/2477
  type: /^s/,
  rules: {
    // NOTE(@mxstbr): Disabled until we decide on the necessity for this API.
    // dotenv: {
    //   args: [`name`],
    //   validate(value, helpers, args): void {
    //     if (!args.name) {
    //       return helpers.error(
    //         `any.dotenv requires the environment variable name`
    //       )
    //     }
    //     return value
    //   },
    //   method(name): Schema {
    //     return this.$_addRule({ name: `dotenv`, args: { name } })
    //   },
    // },
  },
})

// This wrapper lets us throw a warning on any unknown keys being
// added to joi schemas. If we were to only call `pattern` on the
// top level object before passing it to pluginOptionsSchema,
// we would only get root-level validation.
const wrappedJoiObjectWithUnknownWarnings = <TSchema = any, T = TSchema>(
  schema?: SchemaMap<T>
): ObjectSchema<TSchema> => {
  return (joi as unknown as PluginOptionsSchemaJoi).object(schema).pattern(
    /.*/,
    Joi.any().warning(`any.unknown`)
  )
}

joiInstance.object = wrappedJoiObjectWithUnknownWarnings

export * from "./utils/plugin-options-schema-joi-type"
export const Joi: PluginOptionsSchemaJoi = joiInstance
