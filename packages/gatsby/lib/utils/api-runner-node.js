const Promise = require(`bluebird`)
const path = require(`path`)
import invariant from 'invariant'
import _ from 'lodash'
import chalk from 'chalk'
import { siteDB } from '../utils/globals'

const isPromise = (promise) => {
  return !_.isEmpty(promise) && _.isObject(promise) && _.isFunction(promise.then)
}

const runAPI = (plugin, api, args) => {
  let gatsbyNode
  try {
    gatsbyNode = require(`${plugin.resolve}/gatsby-node`)
  } catch (e) {
    // TODO What's a fool proof way to identify a require error as
    // MODULE_NOT_FOUND?
    if (e.code !== `MODULE_NOT_FOUND`) { // &&*/ true) { // !_.includes(e.toString(), `gatsby-node`)) {
      console.log(chalk.bold.red(`Couldn't open the gatsby-node.js file from the plugin at ${plugin.resolve}`))
      throw e
    }
  }
  if (gatsbyNode && gatsbyNode[api]) {
    console.log(`calling api handler in ${plugin.resolve} for api ${api}`)
    const result = gatsbyNode[api]({
      args,
      pluginOptions: plugin.pluginOptions,
    })
    if (!result) {
      throw new Error(`The API "${api}" in gatsby-node.js of the plugin at ${plugin.resolve} did not return a value`)
    }
    if (isPromise(result)) {
      return result
    } else {
      return Promise.resolve(result)
    }
  } else {
    return null
  }
}

module.exports = async (api, args={}) => {
  const plugins = siteDB().get(`plugins`)
  const resultPromises = plugins.map((plugin) => runAPI(plugin, api, args))
  const runSiteGatsbyNode = () => {
    let gatsbyNode
    try {
      gatsbyNode = require(`${path.resolve(`.`)}/gatsby-node`)
    } catch (e) {
      if (/*e.code !== `MODULE_NOT_FOUND` &&*/ !_.includes(e.toString(), `gatsby-node`)) {
        console.log(chalk.bold.red(`Couldn't open your site's gatsby-node.js file`))
        console.log(e)
      }
    }
    if (gatsbyNode && gatsbyNode[api]) {
      const result = gatsbyNode[api]({ args })
      if (!result) {
        console.warn(`The handler for the API "${api}" in your site's gatsby-node.js did not return a value`)
        return null
      }
      if (isPromise(result)) {
        return result
      } else {
        return Promise.resolve(result)
      }
    } else {
      return null
    }
  }
  resultPromises.push(runSiteGatsbyNode())
  const filteredPromises = resultPromises.filter((promise) => isPromise(promise))

  // Return promises with empty results filtered out.
  return await Promise.all(filteredPromises)
  .then((results) => results.filter((result) => !_.isEmpty(result)))
}
