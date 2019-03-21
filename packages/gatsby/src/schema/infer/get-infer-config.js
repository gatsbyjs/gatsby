// @flow

const { Kind } = require(`graphql`)

export interface InferConfig {
  infer: boolean;
  addDefaultResolvers: boolean;
}

const DEFAULT_INFER_CONFIG: InferConfig = {
  infer: true,
  addDefaultResolvers: true,
}

// Get inferance config from type directives
const getInferConfig: (
  typeComposer: TypeComposer
) => InferConfig = typeComposer => {
  const type = typeComposer.getType()
  const inferConfig = { ...DEFAULT_INFER_CONFIG }
  if (type.astNode && type.astNode.directives) {
    type.astNode.directives.forEach(directive => {
      if (directive.name.value === `infer`) {
        inferConfig.infer = true
        inferConfig.addDefaultResolvers = getNoDefaultResolvers(directive)
      } else if (directive.name.value === `dontInfer`) {
        inferConfig.infer = false
        inferConfig.addDefaultResolvers = getNoDefaultResolvers(directive)
      }
    })
  }

  return inferConfig
}

module.exports = getInferConfig

const getNoDefaultResolvers = directive => {
  const noDefaultResolvers = directive.arguments.find(
    ({ name }) => name.value === `noDefaultResolvers`
  )
  if (noDefaultResolvers) {
    if (noDefaultResolvers.value.kind === Kind.BOOLEAN) {
      return !noDefaultResolvers.value.value
    }
  }

  return DEFAULT_INFER_CONFIG.addDefaultResolvers
}
