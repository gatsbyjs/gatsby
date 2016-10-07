module.exports = (api, args, defaultReturn) => {
  let gatsbyBrowser
  try {
    gatsbyBrowser = require(`gatsby-browser`)
  } catch (e) {
    if (e.toString().indexOf(`gatsby-browser`) !== -1) {
      console.log(`Couldn't open your gatsby-browser.js file`)
      console.log(e)
    }
  }
  if (gatsbyBrowser && gatsbyBrowser[api]) {
    const result = gatsbyBrowser[api](args)
    // Internal caller of apiRunner should specify whether a return value
    // is required or not.
    //if (!result) {
      //throw new Error(`The API "${api}" in gatsby-browser.js did not return a value`)
      //process.exit()
    //}
    return result
  }

  return defaultReturn
}

