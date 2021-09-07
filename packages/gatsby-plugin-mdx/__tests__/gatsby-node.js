import { testPluginOptionsSchema } from "gatsby-plugin-utils"
import { pluginOptionsSchema } from "../gatsby-node"

describe(`pluginOptionsSchema`, () => {
  it(`should provide meaningful errors when fields are invalid`, async () => {
    const expectedErrors = [
      `"extensions[0]" must be a string`,
      `"extensions[1]" must be a string`,
      `"extensions[2]" must be a string`,
      `"defaultLayouts" must be of type object`,
      `"gatsbyRemarkPlugins[0]" does not match any of the allowed types`,
      `"gatsbyRemarkPlugins[1]" does not match any of the allowed types`,
      `"remarkPlugins" must be an array`,
      `"rehypePlugins" must be an array`,
      `"plugins[0]" does not match any of the allowed types`,
      `"mediaTypes[0]" must be a string`,
      `"mediaTypes[1]" must be a string`,
      `"shouldBlockNodeFromTransformation" must have an arity lesser or equal to 1`,
      `"root" must be a string`,
    ]

    const { errors } = await testPluginOptionsSchema(pluginOptionsSchema, {
      extensions: [1, 2, 3],
      defaultLayouts: `this should be an object`,
      gatsbyRemarkPlugins: [1, { not: `existing prop` }, `valid one`],
      remarkPlugins: `this should be an array of object`,
      rehypePlugins: `this should be an array of object`,
      plugins: [2],
      mediaTypes: [1, 2],
      shouldBlockNodeFromTransformation: (wrong, number) => null,
      root: 1,
    })

    expect(errors).toEqual(expectedErrors)
  })

  it(`should validate the schema`, async () => {
    const { isValid } = await testPluginOptionsSchema(pluginOptionsSchema, {
      extensions: [`.mdx`, `.mdxx`],
      defaultLayouts: {
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
      lessBabel: false,
      remarkPlugins: [
        require(`../gatsby-node.js`),
        [require(`../gatsby-node.js`), { target: false }],
      ],
      plugins: [{ resolve: `remark-autolink-plugin` }],
      rehypePlugins: [
        require(`../gatsby-node.js`),
        [require(`../gatsby-node.js`), { behavior: `wrap` }],
      ],
      mediaTypes: [`text/markdown`, `text/x-markdown`, `custom-media/type`],
      shouldBlockNodeFromTransformation: node => Boolean(node),
      root: `james-holden`,
    })

    expect(isValid).toBe(true)
  })
})
