import joi from "joi"
import { Root } from "joi"

export interface GatsbyPluginOptionsJoi extends Root {
  // see note from @mxstbr on line 21 in rules
  // /**
  //  * Specifies that a value should be stored in a .env file with ${name}
  //  * instead of inlined into the gatsby-config.js
  //  * @param name - string
  //  */
  // dotenv(name: string): this

}

export const Joi: GatsbyPluginOptionsJoi = joi.extend({
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


