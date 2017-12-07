const path = require(`path`)
const fs = require(`fs`)
const generateRobots = require(`robots-generator`)
const appRootDir = require(`app-root-dir`).get()

const generateRobotsPromisefully = ops =>
  new Promise((resolve, reject) => {
    generateRobots(ops, (error, entries) => {
      if (error) {
        reject(error)
      }
      resolve(entries)
    })
  })

exports.onPostBuild = function onPostBuild(args, ops) {
  generateRobotsPromisefully(ops)
    .then(entries => entries.join(`\n`))
    .then(content =>
      fs.writeFileSync(path.join(appRootDir, `public/robots.txt`), content)
    )
}
