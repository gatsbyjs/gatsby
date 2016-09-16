const Promise = require('bluebird')
const path = require('path')

module.exports = async (api, args, defaultReturn) => {
  let gatsbyNode
  try {
    gatsbyNode = require(`${path.resolve('.')}/gatsby-node`)
  } catch (e) {
    console.log('Couldn\'t open your gatsby-node.js file')
    console.log(e)
  }
  if (gatsbyNode && gatsbyNode[api]) {
    try {
      return await gatsbyNode[api](args)
    } catch (e) {
      console.log('error running API', api)
      console.log('args: ', args)
      console.log('error: ', e)
    }
  }

  return defaultReturn
}
