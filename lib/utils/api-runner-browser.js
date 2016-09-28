const Promise = require(`bluebird`)
const path = require(`path`)
import invariant from 'invariant'
import _ from 'lodash'

module.exports = (api, args, defaultReturn) => {
  let gatsbyBrowser
  try {
    gatsbyBrowser = require(`gatsby-browser`)
  } catch (e) {
    console.log('error', e)
    if (e.code !== `MODULE_NOT_FOUND` && !_.includes(e.Error, `gatsby-browser`)) {
      console.log(`Couldn't open your gatsby-browser.js file`)
      console.log(e)
    }
  }
  console.log('gatsbyBrowser module + api', gatsbyBrowser, api)
  if (gatsbyBrowser && gatsbyBrowser[api]) {
    const result = gatsbyBrowser[api](args)
    if (!result) {
      throw new Error(`The API "${api}" in gatsby-browser.js did not return a value`)
      process.exit()
    }
    return result
  }

  return defaultReturn
}

