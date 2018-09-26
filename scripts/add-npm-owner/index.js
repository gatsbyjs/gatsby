#!/usr/bin/env node
const { getPackages } = require(`@lerna/project`)
const PackageGraph = require(`@lerna/package-graph`)
const filterPackages = require(`@lerna/filter-packages`)
const path = require(`path`)
const util = require(`util`)
const exec = util.promisify(require(`child_process`).exec)
const argv = require(`yargs`)
  .command(`$0 <user>`, `Add new owner to gatsby packages`)
  .help().argv

const rootPath = path.join(__dirname, `../..`)

const getPackagesWithReadWriteAccess = async user => {
  const cmd = `npm access ls-packages ${user}`
  const { stdout } = await exec(cmd)
  const permissions = JSON.parse(stdout)
  return Object.entries(permissions).reduce((acc, [pkgName, access]) => {
    if (access === `read-write`) {
      acc.push(pkgName)
    }
    return acc
  }, [])
}

getPackages(rootPath).then(async packages => {
  const graph = new PackageGraph(packages, `dependencies`, true)

  // filter out private packages
  // adding owner to private packages will fail, because package doesn't exist
  const publicGatsbyPackages = filterPackages(
    graph.rawPackageList,
    [],
    [],
    false
  )

  const alreadyOwnedPackages = await getPackagesWithReadWriteAccess(argv.user)

  const publicGatsbyPackagesWithoutAccess = publicGatsbyPackages.filter(
    pkg => !alreadyOwnedPackages.includes(pkg.name)
  )

  if (!publicGatsbyPackagesWithoutAccess.length) {
    console.log(`${argv.user} has write access to all packages`)
    return
  } else {
    console.log(`Will be adding ${argv.user} to packages:`)
    publicGatsbyPackagesWithoutAccess.forEach(pkg => {
      console.log(` - ${pkg.name}`)
    })
  }

  for (let pkg of publicGatsbyPackagesWithoutAccess) {
    const cmd = `npm owner add ${argv.user} ${pkg.name}`
    try {
      const { stderr } = await exec(cmd)
      if (stderr) {
        console.error(`Error adding ${argv.user} to ${pkg.name}:\n`, stderr)
      } else {
        console.log(`Added ${argv.user} to ${pkg.name}`)
      }
    } catch (e) {
      console.error(`Error adding ${argv.user} to ${pkg.name}:\n`, e.stderr)
    }
  }
})
