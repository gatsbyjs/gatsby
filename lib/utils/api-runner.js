const Promise = require(`bluebird`)
const path = require(`path`)
import invariant from 'invariant'

module.exports = async (api, args, defaultReturn) => {
  let gatsbyNode
  try {
    gatsbyNode = require(`${path.resolve(`.`)}/gatsby-node`)
  } catch (e) {
    console.log(`Couldn't open your gatsby-node.js file`)
    console.log(e)
  }
  if (gatsbyNode && gatsbyNode[api]) {
    const result = await gatsbyNode[api](args)
    if (!result) {
      throw new Error(`The API "${api}" in gatsby-node.js did not return a value`)
      process.exit()
    }
    return result
  }

  return defaultReturn
}
