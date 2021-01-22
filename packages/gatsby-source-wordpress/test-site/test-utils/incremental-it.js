const isIncrement = process.env.WPGQL_INCREMENT

export const incrementalIt = (name, test) => {
  // full fetch
  ;(!isIncrement ? it : it.skip)(name, test)
  // incremental data fetch
  ;(isIncrement ? it : it.skip)(`${name} INCREMENTED`, test)
}
