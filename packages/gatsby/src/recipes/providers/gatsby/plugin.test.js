// const plugin = require(`./plugin`)
const fs = require(`fs`)
const path = require(`path`)

test(`babel plugin to get list of plugins and their options!`, () => {
  const configSrc = fs.readFileSync(
    path.join(__dirname, `./fixtures/sample-gatsby-config.js`),
    `utf-8`
  )
  console.log({ configSrc })
})
