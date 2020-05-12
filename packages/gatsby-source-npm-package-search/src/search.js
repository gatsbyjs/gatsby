const algoliasearch = require(`algoliasearch`)
const client = algoliasearch(`OFCNCOG2CU`, `6fbcaeafced8913bf0e4d39f0b541957`)
const searchIndex = client.initIndex(`npm-search`)

exports.browse = ({ ...params }) => {
  let hits = []
  const browser = searchIndex.browseAll(params)

  return new Promise((resolve, reject) => {
    browser.on(`result`, content => (hits = hits.concat(content.hits)))
    browser.on(`end`, () => resolve(hits))
    browser.on(`error`, err => reject(err))
  })
}
