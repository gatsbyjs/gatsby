const algoliasearch = require(`algoliasearch`)
const client = algoliasearch(`OFCNCOG2CU`, `6fbcaeafced8913bf0e4d39f0b541957`)
const searchIndex = client.initIndex(`npm-search`)

exports.browse = ({ ...params }) => {
  let hits = []

  return searchIndex
    .browseObjects({
      batch: batch => (hits = hits.concat(batch)),
      ...params,
    })
    .then(() => hits)
}
