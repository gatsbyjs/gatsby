---
title: Validating Plugin Options
---

To help users [configure plugins](/docs/configuring-usage-with-plugin-options/) correctly, a plugin can optionally define a schema to enforce a type for each option. Gatsby will validate that the options users pass match the schema to help them correctly set up their site.

## How to define an options schema

You should use the [`pluginOptionsSchema`](/docs/node-apis/#pluginOptionsSchema) API to define your plugins' options schema. It gets passed an instance of [Joi](https://joi.dev), which you use to return a [`Joi.object`](https://joi.dev/api/?v=17.3.0#object) schema for the options you expect users to pass.

For example, imagine you were creating a plugin called `gatsby-plugin-console-log`. You decide you want users to configure your plugin using the following options:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-console-log`,
      options: {
        optionA: true,
        message: "Hello world"
        optionB: false, // Optional.
      },
    },
  ],
}
```

You want users to pass in a boolean to `optionA` and a string to `message`, and they can optionally pass a boolean to `optionB`. To enforce these rules, you would create the following `pluginOptionsSchema`:

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

If users pass options that do not match the schema, the validation will show an error when they run `gatsby develop` and prompt them to fix their configuration.

## Best practices for option schemas

The [Joi API documentation](https://joi.dev/api/) is a great reference to use while working on a `pluginOptionsSchema`, as it shows all the available types and methods.

Here are some specific Joi best practices for `pluginOptionsSchema`s:

- [Add descriptions](#add-descriptions)
- [Set default options](#set-default-options)
- [Validate external access](#validate-external-access) where necessary
- [Add custom error messages](#add-custom-error-messages) where useful
- [Deprecate options](#deprecating-options) in a major version release rather than removing them

### Add descriptions

Make sure that every option and field has a [`.description()`](https://joi.dev/api/?v=17.3.0#anydescriptiondesc) explaining its purpose. This is helpful for documentation as users can look at the schema and understand all the options. There might also be tooling in the future that auto-generates plugin option documentation from the schema.

### Set default options

You can use the [`.default()` method](https://joi.dev/api/?v=17.3.0#anydefaultvalue) to set a default value for an option. For example, in the `gatsby-plugin-console-log` plugin above, you could have the `message` option default to `"default message"` if a user does not pass their own `message` value:

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

Accessing `pluginOptions.message` would then log `"default message"` in all plugin APIs if the user does not supply their own value.

### Validate external access

Some plugins (particularly source plugins) query external APIs. With the [`.external()`](https://joi.dev/api/?v=17.3.0#anyexternalmethod-description) method, you can asynchronously validate that the user has access to the API, providing a better experience if they pass invalid secrets.

For example, this is how the [Contentful source plugin](/plugins/gatsby-source-contentful/) might validate that the user has access to the space they are trying to query:

```javascript:title=gatsby-source-contentful/gatsby-node.js
exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    accessToken: Joi.string().required(),
    spaceId: Joi.string().required(),
    // ...more options here...
  }).external(async pluginOptions => {
    try {
      await contentful
        .createClient({
          space: pluginOptions.spaceId,
          accessToken: pluginOptions.accessToken,
        })
        .getSpace()
    } catch (err) {
      throw new Error(
        `Cannot access Contentful space "${pluginOptions.spaceId}" with the provided access token. Double check they are correct and try again!`
      )
    }
  })
}
```

### Add custom error messages

Sometimes you might want to provide more detailed error messages when validation fails for a specific field. Joi provides a [`.messages()` method](https://joi.dev/api/?v=17.2.1#anymessagesmessages) which lets you override error messages for specific [error types](https://joi.dev/api/?v=17.2.1#list-of-errors) (e.g. `"any.required"` when a `.required()` call fails).

For example, in the `gatsby-plugin-console-log` plugin above, this is how you would provide a custom error message if users do not specify `optionA`:

```javascript:title=plugins/gatsby-plugin-console-log/gatsby-node.js
exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    optionA: Joi.boolean()
      .required()
      .description(`Enables optionA.`)
      // highlight-start
      .messages({
        // Override the error message if the .required() call fails
        "any.required": `"optionA" needs to be specified to true or false. Get the correct value from your dashboard settings.`,
      }),
    // highlight-end
    message: Joi.string()
      .default(`default message`)
      .description(`The message logged to the console.`),
    optionB: Joi.boolean().description(`Enables optionB.`),
  })
}
```

### Deprecating options

While you can simply remove options from the schema in major versions, that causes cryptic error messages for users upgrading with existing configuration. Instead, deprecate them using the [`.forbidden()` method](https://joi.dev/api/?v=17.2.1#anyforbidden) in a major version release. Then, [add a custom error message](#add-custom-error-messages) explaining how users should upgrade the functionality using `.messages()`.

For example:

```javascript:title=plugins/gatsby-plugin-console-log/gatsby-node.js
  return Joi.object({
    optionA: Joi.boolean()
      .required()
      .description(`Enables optionA.`)
      // highlight-start
      .forbidden()
      .messages({
        // Override the error message if the .forbidden() call fails
        "any.unknown": `"optionA" is no longer supported. Use "optionB" instead by setting it to the same value you had before on "optionA".`,
      }),
      // highlight-end
    message: Joi.string()
      .default(`default message`)
      .description(`The message logged to the console.`),
    optionB: Joi.boolean().description(`Enables optionB.`),
  })
}
```

## Unit testing an options schema

To verify that a `pluginOptionsSchema` behaves as expected, unit test it with different configurations using the [`gatsby-plugin-utils` package](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-utils#testpluginoptionsschema).

1. Add the `gatsby-plugin-utils` package to your site:

   ```shell
   npm install gatsby-plugin-utils
   ```

2. Use the `testPluginOptionsSchema` function exported from the package in your test file. It takes two parameters, the plugin's actual Joi schema and an example options object to test. It returns an object with an `isValid` boolean, which will be true or false based on whether or not the options object fits the actual Joi schema, and an `errors` array, which will contain the error messages if the validation failed.

For example, with [Jest](https://jestjs.io), your tests might look something like this:

```javascript:title=plugins/gatsby-plugin-console/__tests__/gatsby-node.js
// This is an example using Jest (https://jestjs.io/)
import { testPluginOptionsSchema } from "gatsby-plugin-utils"
import { pluginOptionsSchema } from "../gatsby-node"

describe(`pluginOptionsSchema`, () => {
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
})
```

## Additional resources

- [Joi API documentation](https://joi.dev/api/)
- [`pluginOptionsSchema` for the Contentful source plugin](https://github.com/gatsbyjs/gatsby/blob/af973d4647dc14c85555a2ad8f1aff08028ee3b7/packages/gatsby-source-contentful/src/gatsby-node.js#L75-L159)
