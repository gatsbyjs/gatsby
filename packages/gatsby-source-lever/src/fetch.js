const axios = require(`axios`)
const httpExceptionHandler = require(`./http-exception-handler`)

/**
 * High-level function to coordinate fetching data from Lever.co
 * site.
 */
async function fetch({
  site,
  verbose,
  typePrefix,
}) {
  // return require(`./data.json`)

  // If the site is hosted on wordpress.com, the API Route differs.
  // Same entity types are exposed (excepted for medias and users which need auth)
  // but the data model contain slights variations.
  let entities = []
  try {
    entities = await axios({
      method: `get`,
      url: `https://api.lever.co/v0/postings/${site}?mode=json`,
    })
  } catch (e) {
    httpExceptionHandler(e)
  }

  return entities
}
module.exports = fetch
