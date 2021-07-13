const _ = require(`lodash`)

const copyRuntimeCaching = arr => arr.map(c => _.cloneDeep(c))

const appendRuntimeCaching = (options, workboxConfig) => {
  const defaultRuntimeCaching = copyRuntimeCaching(options.runtimeCaching)
  const workboxRuntimeCaching = copyRuntimeCaching(workboxConfig.runtimeCaching)

  const mergedOptions = _.merge(options, workboxConfig)

  return {
    ...mergedOptions,
    runtimeCaching: defaultRuntimeCaching.concat(workboxRuntimeCaching),
  }
}

const replaceRuntimeCaching = (options, workboxConfig) => {
  const defaultRuntimeCaching = copyRuntimeCaching(options.runtimeCaching)
  const workboxRuntimeCaching = copyRuntimeCaching(workboxConfig.runtimeCaching)
  const replacedRuntimeCaching = workboxRuntimeCaching.map(
    workboxCaching =>
      defaultRuntimeCaching.find(
        defaultCaching =>
          defaultCaching.urlPattern === workboxCaching.urlPattern
      ) || workboxCaching
  )

  const mergedOptions = _.merge(options, workboxConfig)

  return { ...mergedOptions, runtimeCaching: replacedRuntimeCaching }
}

const mergeWorkboxConfig = (
  options,
  workboxConfig,
  runtimeCachingMergeStrategy = `merge`
) => {
  const runtimeCachingMergeStrategyList = [`merge`, `append`, `replace`]

  if (!runtimeCachingMergeStrategyList.includes(runtimeCachingMergeStrategy)) {
    throw new Error(
      `Invalid runtimeCachingMergeStrategy has been specified option.`
    )
  }

  let f
  if (runtimeCachingMergeStrategy === `merge`) {
    f = _.merge
  } else if (runtimeCachingMergeStrategy === `append`) {
    f = appendRuntimeCaching
  } else if (runtimeCachingMergeStrategy === `replace`) {
    f = replaceRuntimeCaching
  }

  return f(options, workboxConfig)
}

module.exports = mergeWorkboxConfig
