import { testPluginOptionsSchema } from "gatsby-plugin-utils"
import { pluginOptionsSchema } from "../gatsby-node"

describe(`pluginOptionsSchema`, () => {
  it(`should provide meaningful errors when fields are invalid`, () => {
    const expectedErrors = [
      `"extensions" "[0]" must be a string. "[1]" must be a string. "[2]" must be a string`,
      `"defaultLayout" must be of type object`,
      `"gatsbyRemarkPlugins" "[0]" does not match any of the allowed types. "[1]" does not match any of the allowed types`,
      `"remarkPlugins" must be an array`,
      `"rehypePlugins" must be an array`,
      `"mediaTypes" "[0]" must be a string. "[1]" must be a string`,
      `"shouldBlockNodeFromTransformation" must have an arity lesser or equal to 1`,
    ]

    const { errors } = testPluginOptionsSchema(pluginOptionsSchema, {
      extensions: [1, 2, 3],
      defaultLayout: `this should be an object`,
      gatsbyRemarkPlugins: [1, { not: `existing prop` }, `valid one`],
      remarkPlugins: `this should be an array of object`,
      rehypePlugins: `this should be an array of object`,
      mediaTypes: [1, 2],
      shouldBlockNodeFromTransformation: (wrong, number) => null,
    })

    expect(errors).toEqual(expectedErrors)
  })

  it(`should validate the schema`, () => {
    const { isValid } = testPluginOptionsSchema(pluginOptionsSchema, {
      extensions: [`.mdx`, `.mdxx`],
      defaultLayout: {
        posts: `../post-layout.js`,
        default: `../default-layout.js`,
      },
      gatsbyRemarkPlugins: [
        {
          resolve: `gatsby-remark-images`,
          options: {
            maxWidth: 590,
          },
        },
        `gatsby-remark-other-plugin`,
      ],
      remarkPlugins: [
        require(`../gatsby-node.js`),
        [require(`../gatsby-node.js`), { target: false }],
      ],
      rehypePlugins: [
        require(`../gatsby-node.js`),
        [require(`../gatsby-node.js`), { behavior: `wrap` }],
      ],
      mediaTypes: [`text/markdown`, `text/x-markdown`, `custom-media/type`],
      shouldBlockNodeFromTransformation: node => Boolean(node),
    })

    expect(isValid).toBe(true)
  })
})
