const https = require(`https`)
const execSync = require(`child_process`).execSync
const fs = require(`fs`)
const path = require(`path`)
const util = require(`util`)

const fileSavePath = path.resolve(
  __dirname,
  `../src/prism-language-dependencies.js`
)

function getVersion() {
  const version = JSON.parse(execSync(`yarn info prismjs version --json`))
  return version.data
}

function processData(data, url) {
  // `components.js`:
  // var components = {
  //   "core": { ... },
  //   "languages": { ... },
  //   ...
  // }
  eval(data)
  if (typeof components === `undefined`) {
    throw new Error(`The content structure of \`components.js\` seems changed.`)
  }

  // eslint-disable-next-line no-undef
  const languages = components.languages
  const content = `// From ${JSON.stringify(url)}
module.exports = ${util.inspect(languages)}
`

  fs.writeFileSync(fileSavePath, content, `utf8`)
}

function requestData() {
  const version = getVersion()
  const url = `https://raw.githubusercontent.com/PrismJS/prism/v${version}/components.js`

  https
    .get(url, res => {
      if (res.statusCode !== 200) {
        throw new Error(
          `Request Failed.\nRequest URL: ${url}\nStatus Code: ${res.statusCode}`
        )
      }

      res.setEncoding(`utf8`)
      let rawData = ``
      res.on(`data`, chunk => {
        rawData += chunk
      })

      res.on(`end`, () => {
        try {
          processData(rawData, url)
        } catch (e) {
          console.error(e.message)
        }
      })
    })
    .on(`error`, e => {
      console.error(e.message)
    })
}

requestData()
