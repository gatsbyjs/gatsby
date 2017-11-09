import R from "ramda"

export const faultyKeywords = [
  `length`,
]

// TODO: provide a link to aliasing section in plugin's README
export const keywordsError = `Found unaliased reserved field with a name matching one of ${faultyKeywords}. Build failed! Please refer to the caveats in the gatsby-source-graphcms README for a solution. (link)`

// Checking if the query we pass in config has any of the faulty fields
export const checkForFaultyFields = (data, keywords) => {
  const getAllKeys = (obj) => {
    const all = []
    const getKeys = (obj) =>
      all.push(
        ...Object.keys(obj).map(key => 
          obj[key] instanceof Object
          ? getKeys(obj[key])
          : key
        )
      )
    getKeys(obj)
    return all
  }

  const containsKeywords = R.intersection(getAllKeys(data), keywords).length > 0

  return containsKeywords
}