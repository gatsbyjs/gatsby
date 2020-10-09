# gatsby-plugin-utils

## Usage

```shell
npm install gatsby-plugin-utils
```

### validateOptionsSchema

#### example

```js
import { validateOptionsSchema } from "gatsby-plugin-utils"

await validateOptionsSchema(pluginName, pluginSchema, pluginOptions)
```

### testPluginOptionsSchema

Utility to validate and test plugin options schemas. An example of a plugin options schema implementation can be found in the [gatsby-node.js file of gatsby-plugin-google-analytics](../gatsby-plugin-google-analytics/gatsby-node.js).

#### example

```js
import { testPluginOptionsSchema } from "gatsby-plugin-utils"

it(`should partially validate one value of a schema`, () => {
  const pluginSchema = ({ Joi }) =>
    Joi.object({
      someOtherValue: Joi.string()
      toVerify: Joi.boolean(),
    })

  // Only the "toVerify" key of the schema will be verified in this test
  const { isValid, errors } = testPluginOptionsSchema(pluginSchema, {
    toVerify: `abcd`,
  })

  expect(isValid).toBe(false)
  expect(errors).toEqual([`"toVerify" must be a boolean`])
})
```
