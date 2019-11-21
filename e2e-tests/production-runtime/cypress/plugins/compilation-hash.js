const fs = require(`fs-extra`)
const path = require(`path`)
const glob = require(`glob`)

const replaceHtmlCompilationHash = (filename, newHash) => {
  const html = fs.readFileSync(filename, `utf-8`)
  const regex = /window\.webpackCompilationHash="\w*"/
  const replace = `window.webpackCompilationHash="${newHash}"`
  fs.writeFileSync(filename, html.replace(regex, replace), `utf-8`)
}

const replacePageDataCompilationHash = (filename, newHash) => {
  const pageData = JSON.parse(fs.readFileSync(filename, `utf-8`))
  pageData.webpackCompilationHash = newHash
  fs.writeFileSync(filename, JSON.stringify(pageData), `utf-8`)
}

const overwriteWebpackCompilationHash = newHash => {
  glob
    .sync(path.join(__dirname, `../../public/page-data/**/page-data.json`))
    .forEach(filename => replacePageDataCompilationHash(filename, newHash))
  glob
    .sync(path.join(__dirname, `../../public/**/*.html`))
    .forEach(filename => {
      // `page-data/404.html` matches the glob above but is a directory
      // (containing `page-data.json`), so ignore this and similar dirs
      if (!filename.match(/\/page-data\/[^/.]+\.html/))
        replaceHtmlCompilationHash(filename, newHash)
    })

  // cypress requires that null be returned instead of undefined
  return null
}

module.exports = {
  overwriteWebpackCompilationHash,
}
