const lernaGetPackages = require(`lerna-get-packages`)
const path = require(`path`)
const shell = require(`shelljs`)

const packages = lernaGetPackages(path.join(`../..`, __dirname))

packages.forEach(p => {
  const command = `npm owner add ${process.argv.slice(2, 3)} ${p.package.name}`
  shell.exec(command)
  // console.log(command)
})
