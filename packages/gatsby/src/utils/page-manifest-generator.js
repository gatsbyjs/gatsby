const fs = require(`fs-extra`)

function getManifestPath(pagePath) {
  if (pagePath.endsWith(`.html`)) {
    return `${pagePath.substr(0, pagePath.length - 5)}.manifest.json`
  }
  if (!pagePath.endsWith(`/`)) {
    pagePath += `/`
  }
  return pagePath + `index.manifest.json`
}

async function generatePageManifests() {
  const webpackStats = JSON.parse(
    fs.readFileSync(`${process.cwd()}/public/webpack.stats.json`, `utf-8`)
  )
  const pageData = JSON.parse(
    fs.readFileSync(`${process.cwd()}/.cache/data.json`, `utf-8`)
  )

  for (const page of pageData.pages) {
    page.dataPath = pageData.dataPaths[page.jsonName]
    page.assets = webpackStats.namedChunkGroups[page.componentChunkName].assets
    await fs.outputFile(
      `${process.cwd()}/public` + getManifestPath(page.path),
      JSON.stringify(page)
    )
  }
}

module.exports = generatePageManifests
