const getIsIncrement = () =>
  !!(process.env.WPGQL_INCREMENT && process.env.WPGQL_INCREMENT !== `false`)

exports.incrementalIt = (name, test) => {
  const isIncrement = getIsIncrement()

  // full fetch
  ;(!isIncrement ? it : it.skip)(name, test)
  // incremental data fetch
  ;(isIncrement ? it : it.skip)(`${name} INCREMENTED`, test)
}

exports.getIsIncrement = getIsIncrement
