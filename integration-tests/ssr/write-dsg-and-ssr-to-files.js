async function run() {
  const fetch = require(`node-fetch`)
  const fs = require(`fs-extra`)
  const pagesUsingEngines = require(`./pages-using-engines`)

  const devSiteBasePath = `http://localhost:9000`

  for (const [pagePath, htmlLocation] of Object.entries(pagesUsingEngines)) {
    const rawHtml = await fetch(`${devSiteBasePath}/${pagePath}`).then(res => {
      devStatus = res.status
      return res.text()
    })

    await fs.outputFile(htmlLocation, rawHtml)
  }
}
run()
