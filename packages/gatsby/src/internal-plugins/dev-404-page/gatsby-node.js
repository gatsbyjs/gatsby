const path = require(`path`)
const fs = require(`fs-extra`)
const chokidar = require(`chokidar`)

exports.createPagesStatefully = async ({ actions, cache }, options, done) => {
  if (process.env.NODE_ENV !== `production`) {
    const { createPage } = actions
    const source = path.join(__dirname, `./raw_dev-404-page.js`)
    const destination = cache.rootPath(`dev-404-page.js`)
    const copy = () => fs.copy(source, destination)
    await copy()
    createPage({
      component: destination,
      path: `/dev-404-page/`,
    })
    chokidar
      .watch(source)
      .on(`change`, () => copy())
      .on(`ready`, () => done())
  } else {
    done()
  }
}
