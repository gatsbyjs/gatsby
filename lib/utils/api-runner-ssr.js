const Promise = require(`bluebird`)
const path = require(`path`)
import invariant from 'invariant'
import _ from 'lodash'

module.exports = (api, args, defaultReturn) => {
  let gatsbySSR
  try {
    gatsbySSR = require(`gatsby-ssr`)
  } catch (e) {
    if (e.code !== `MODULE_NOT_FOUND` && !_.includes(e.Error, `gatsby-browser`)) {
      console.log(`Couldn't open your gatsby-browser.js file`)
      console.log(e)
    }
  }
  if (gatsbySSR && gatsbySSR[api]) {
    const result = gatsbySSR[api](args)
    if (!result) {
      throw new Error(`The API "${api}" in gatsby-browser.js did not return a value`)
      process.exit()
    }
    return result
  }

  return defaultReturn
}


