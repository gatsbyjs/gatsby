const path = require(`path`)
const fs = require(`fs-extra`)
const axios = require(`axios`)

const API_FILE = `https://unpkg.com/gatsby/apis.json`
const ROOT = path.join(__dirname, `..`, `..`)
const OUTPUT_FILE = path.join(ROOT, `latest-apis.json`)

module.exports = async function getLatestAPI() {
  /*
   * Happy path `postinstall` script created the file
   */
  if (await fs.exists(OUTPUT_FILE)) {
    return fs.readJSON(OUTPUT_FILE)
  }

  try {
    const { data } = await axios.get(API_FILE)

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2), `utf8`)

    return data
  } catch (e) {
    // possible offline/network issue
    return fs.readJSON(path.join(ROOT, `apis.json`)).catch(() => {
      return {
        browser: {},
        node: {},
        ssr: {},
      }
    })
  }
}
