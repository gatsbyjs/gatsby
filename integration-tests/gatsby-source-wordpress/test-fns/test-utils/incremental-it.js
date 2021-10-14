const isWarmCache = process.env.WARM_CACHE

exports.incrementalIt = (name, test) => {
  // full fetch
  ;(!isWarmCache ? it : it.skip)(name, test)
  // incremental data fetch
  ;(isWarmCache ? it : it.skip)(`${name} INCREMENTED`, test)
}
