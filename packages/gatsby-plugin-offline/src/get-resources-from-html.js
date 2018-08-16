const cheerio = require(`cheerio`)
const path = require(`path`)
const fs = require(`fs`)
const _ = require(`lodash`)

module.exports = htmlPath => {
  // load index.html to pull scripts/links necessary for proper offline reload
  let html
  try {
    // load index.html to pull scripts/links necessary for proper offline reload
    html = fs.readFileSync(path.resolve(htmlPath))
  } catch (err) {
    // ENOENT means the file doesn't exist, which is to be expected when trying
    // to open 404.html if the user hasn't created a custom 404 page -- return
    // an empty array.
    if (err.code === `ENOENT`) {
      return []
    } else {
      throw err
    }
  }

  // party like it's 2006
  const $ = cheerio.load(html)

  // holds any paths for scripts and links
  const criticalFilePaths = []

  $(`
    script[src],
    link[as=script],
    link[as=font],
    link[as=fetch],
    link[rel=stylesheet],
    style[data-href]
  `).each((_, elem) => {
    const $elem = $(elem)
    const url =
      $elem.attr(`src`) || $elem.attr(`href`) || $elem.attr(`data-href`)
    const blackListRegex = /\.xml$/

    if (!blackListRegex.test(url)) {
      let path = url
      if (url.substr(0, 4) !== `http`) {
        path = `public${url}`
      }

      criticalFilePaths.push(path)
    }
  })

  return _.uniq(criticalFilePaths)
}
