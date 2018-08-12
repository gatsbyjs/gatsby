const cheerio = require(`cheerio`)
const path = require(`path`)
const fs = require(`fs`)
const _ = require(`lodash`)

module.exports = htmlPath => {
  // load index.html to pull scripts/links necessary for proper offline reload
  const html = fs.readFileSync(path.resolve(htmlPath))

  // party like it's 2006
  const $ = cheerio.load(html)

  // holds any paths for scripts and links
  const criticalFilePaths = []

  $(`script[src], link[as=script], link[as=font], link[as=fetch]`).each(
    (_, elem) => {
      const $elem = $(elem)
      const url = $elem.attr(`src`) || $elem.attr(`href`)
      const blackListRegex = /\.xml$/

      if (!blackListRegex.test(url)) {
        let path = url
        if (url.substr(0, 4) !== `http`) {
          path = `public${url}`
        }

        criticalFilePaths.push(path)
      }
    }
  )

  return _.uniq(criticalFilePaths)
}
