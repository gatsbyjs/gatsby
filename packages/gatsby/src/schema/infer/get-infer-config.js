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
    ...DEFAULT_INFER_CONFIG,
    ...(typeComposer.getExtension(`inferConfig`) || {}),
  }
}

module.exports = getInferConfig
