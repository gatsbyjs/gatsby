const _ = require(`lodash`)

module.exports = (api, args, defaultReturn) => {
  let gatsbySSR
  try {
    gatsbySSR = require(`gatsby-ssr`)
  } catch (e) {
    if (/*e.code !== `MODULE_NOT_FOUND` &&*/ !_.includes(e.toString(), `gatsby-ssr`)) {
      console.log(`Couldn't open your gatsby-browser.js file`)
      console.log(e)
    }
  }
  if (gatsbySSR && gatsbySSR[api]) {
    const result = gatsbySSR[api](args)
    if (!result) {
      throw new Error(`The API "${api}" in gatsby-ssr.js did not return a value`)
    }
    return result
  }

  return defaultReturn
}
