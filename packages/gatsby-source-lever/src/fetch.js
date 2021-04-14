const axios = require(`axios`)
const httpExceptionHandler = require(`./http-exception-handler`)

/**
 * High-level function to coordinate fetching data from Lever.co
 * site.
 */
async function fetch({ site, verbose, typePrefix }) {
  // return require(`./data.json`)

  let entities = []
  try {
    const res = await axios({
      method: `get`,
      url: `https://api.lever.co/v0/postings/${site}?mode=json`,
    })
    entities = res.data
  } catch (e) {
    httpExceptionHandler(e)
  }

  return entities
}
module.exports = fetch
