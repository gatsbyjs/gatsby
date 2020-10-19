---
title: Validating plugin options
---

To help users [configure plugins](/docs/configuring-usage-with-plugin-options/) correctly, a plugin can optionally define a schema to enforce a type for each option. When users of the plugin pass configuration options, Gatsby will validate that the options match the schema.

## How to define an options schema

To define their options schema, plugins export a [`pluginOptionsSchema`](/docs/node-apis/#pluginOptionsSchema) from the `gatsby-node.js`. This function gets passed an instance of [Joi](https://joi.dev) to define the schema with.

For example, consider the following plugin called `gatsby-plugin-console-log`:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-console-log`,
      options: { optionA: true, optionB: false, message: "Hello world" },
    },
  ],
}
```

`gatsby-plugin-console-log` can ensure users have to pass a boolean to `optionA` and a string to `message`, as well as optionally pass a boolean to `optionB`, with this `pluginOptionsSchema`:

```javascript:title=plugins/gatsby-plugin-console-log/gatsby-node.js
exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    optionA: Joi.boolean().required().description(`Enables optionA.`),
    message: Joi.string()
      .required()
      .description(`The message logged to the console.`),
    optionB: Joi.boolean().description(`Enables optionB.`),
  })
}
```

If users pass options that do not match the schema, the validation will show an error when they run `gatsby develop` and prompt them to fix thier configuration.

## Unit testing an options schema

To verify that a `pluginOptionsSchema` behaves as expected, unit test it with different configurations using the [`gatsby-plugin-utils` package](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-utils#testpluginoptionsschema).

1. Add the `gatsby-plugin-utils` package to your site:

   ```shell
   yarn add gatsby-plugin-utils
   ```

   or

   ```shell
   npm install gatsby-plugin-utils
   ```

2. Use the `testPluginOptionsSchema` function exported from it in your test file. For example, with [Jest](https://jestjs.io):

   ```javascript:title=plugins/gatsby-plugin-console/__tests__/pluginOptionsSchema.test.js
   // This is an example using Jest (https://jestjs.io/)
   import { testPluginOptionsSchema } from "gatsby-plugin-utils"
   import { pluginOptionsSchema } from "../gatsby-node"

   it(`should invalidate incorrect options`, () => {
     const options = {
       optionA: undefined, // Should be a boolean
       message: 123, // Should be a string
       optionB: `not a boolean`, // Should be a boolean
     }
     const { isValid, errors } = testPluginOptionsSchema(
       pluginOptionsSchema,
       options
     )

     expect(isValid).toBe(false)
     expect(errors).toEqual([
       `"optionA" is required`,
       `"message" must be a string`,
       `"optionB" must be a boolean`,
     ])
   })

   it(`should validate correct options`, () => {
     const options = {
       optionA: false,
       message: "string",
       optionB: true,
     }
     const { isValid, errors } = testPluginOptionsSchema(
       pluginOptionsSchema,
       options
     )

     expect(isValid).toBe(true)
     expect(errors).toEqual([])
   })
   ```

## Joi best practices

The [Joi API documentation](https://joi.dev/api/) is a great reference to use while working on a `pluginOptionsSchema` to see all the available types and methods.

Some specific Joi best practices for `pluginOptionsSchema`s.

### Setting default options

You can use the `.default()` method to set a default for an option. For example with `gatsby-plugin-console-log`, this is how it can default the `message` option to "default message" in case users do not pass their own:

```javascript:title=plugins/gatsby-plugin-console-log/gatsby-node.js
exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    optionA: Joi.boolean().required().description(`Enables optionA.`),
    message: Joi.string()
      .default(`default message`) // highlight-line
      .description(`The message logged to the console.`),
    optionB: Joi.boolean().description(`Enables optionB.`),
  })
}
```

Accessing `pluginOptions.message` would then log `"default message"` in all plugin APIs if users do not supply their own value:

```javascript:title=plugins/gatsby-plugin-console-log/gatsby-node.js
exports.onPreInit = (_, pluginOptions) => {
  console.log(
    `logging: "${pluginOptions.message}" to the console` // highlight-line
  )
}
```

### Validating external access

TK `.external()`

### Using custom error messages

TK `.messages()`

### Deprecating options

TK `.forbidden()`

## Additional resources

- [Joi API documentation](https://joi.dev/api/)
- [`pluginOptionsSchema` for the Contentful source plugin](https://github.com/gatsbyjs/gatsby/blob/af973d4647dc14c85555a2ad8f1aff08028ee3b7/packages/gatsby-source-contentful/src/gatsby-node.js#L75-L159)
