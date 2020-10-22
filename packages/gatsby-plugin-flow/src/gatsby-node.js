export const onCreateBabelConfig = ({ actions }) => {
  actions.setBabelPreset({
    name: require.resolve(`@babel/preset-flow`),
  })
}

export const pluginOptionsSchema = ({ Joi }) => Joi.object({})
