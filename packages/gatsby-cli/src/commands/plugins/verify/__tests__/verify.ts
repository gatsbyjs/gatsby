import path from "path"
import { verifyCommand } from ".."
import gatsbyNode from "./gatsby-node"

jest.mock(`path`)

describe(`verify command`, () => {
  it(`should show an explicit error when gatsby-node.js doesn't exist in the project`, async () => {
    ;(path.join as any).mockReturnValue(`../`)

    expect(await verifyCommand()).toMatchInlineSnapshot(`
      "
      ⚠️  This project doesn't own a \\"gatsby-node.js\\" file. To run the gatsby plugin verify command, you must have a gatsby-node.js file with a \\"pluginOptionsSchema\\" function exported."
    `)
  })

  it(`should show an explicit error when "pluginOptionsSchema" doesn't exist in gatsby-node.js`, async () => {
    ;(gatsbyNode as any).someFakeOptions = `some-fake-value`
    ;(path.join as any).mockReturnValue(`./__tests__/gatsby-node.js`)

    expect(await verifyCommand()).toMatchInlineSnapshot(`
      "
      ⚠️  The gatsby-node.js file in this project doesn't export the \\"pluginOptionsSchema\\". Here's an example:

          exports.pluginOptionsSchema = ({ Joi }) =>
            Joi.object({
                trackingId: Joi.string()
                  .required()
                  .description(
                    \\"The property ID; the tracking code won't be generated without it\\"
                  ),
              })"
    `)
  })

  it(`should show an error with details when Joi is not able to validate the schema`, async () => {
    ;(path.join as any).mockReturnValue(`./__tests__/gatsby-node.js`)
    ;(gatsbyNode as any).pluginOptionsSchema = jest.fn(() => `some-fake-value`)

    expect(await verifyCommand()).toMatchInlineSnapshot(`
      "
      ⚠️  An error occurred when trying to validate the schema. It might be incorrect:

          pluginSchema.validateAsync is not a function
          "
    `)
  })

  it(`should show an error with details when pluginOptionsSchema is not a function`, async () => {
    ;(path.join as any).mockReturnValue(`./__tests__/gatsby-node.js`)
    ;(gatsbyNode as any).pluginOptionsSchema = `some-fake-value`

    expect(await verifyCommand()).toMatchInlineSnapshot(`
      "
      ⚠️  The \\"pluginOptionsSchema\\" is actually of type \\"string\\" while it should be of type \\"function\\". Here is the signature of the \\"pluginOptionsSchema\\" function:

          exports.pluginOptionsSchema = ({ Joi }) => /* schema goes here */
          "
    `)
  })

  it(`should show a generic error when we don't know the cause`, async () => {
    ;(path.join as any).mockReturnValue(`./__tests__/gatsby-node.js`)
    ;(gatsbyNode as any).pluginOptionsSchema = jest.fn(() => {
      throw new Error(`Something wrong happens`)
    })

    expect(await verifyCommand()).toMatchInlineSnapshot(`
      "
      ⚠️  An error occurred that we don't have control over: Something wrong happens."
    `)
  })
})
