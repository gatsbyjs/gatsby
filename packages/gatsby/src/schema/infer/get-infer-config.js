// @flow

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
  return {
    infer: typeComposer.hasExtension(`infer`)
      ? typeComposer.getExtension(`infer`)
      : DEFAULT_INFER_CONFIG.infer,
    addDefaultResolvers: typeComposer.hasExtension(`addDefaultResolvers`)
      ? typeComposer.getExtension(`addDefaultResolvers`)
      : DEFAULT_INFER_CONFIG.addDefaultResolvers,
  }
}

module.exports = getInferConfig
