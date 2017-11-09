import R from "ramda"

export const faultyKeywords = [
  'length',
  'prototype',
  'constructor'
]

export const keywordsError = `One or more of your project's fields has a name matching one of ( ${faultyKeywords} ) which due to current limitations has to change in order for the plugin to get all the data correctly`

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