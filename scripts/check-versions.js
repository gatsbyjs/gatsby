const { writeFileSync } = require(`fs`)
const yargs = require(`yargs`)
const Repository = require(`lerna/lib/Repository`)
const PackageUtilities = require(`lerna/lib/PackageUtilities`)

const packages = PackageUtilities.getPackages(new Repository())

let warned = false
let argv = yargs.option(`fix`).argv

packages.forEach(pkg => {
  const outdated = packages
    .filter(p => !!pkg.allDependencies[p.name] && p.name !== pkg.name)
    .filter(p => !pkg.hasMatchingDependency(p))

  if (!outdated.length) return

  warned = true
  const msg = outdated
    .map(
      p =>
        `  Depends on "${p.name}@${pkg.allDependencies[p.name]}" \n` +
        `  instead of "${p.name}@${p.version}". \n`
    )
    .join(`\n`)

  console.error(`${pkg.name}: \n${msg}`)

  if (argv.fix) {
    let next = pkg.toJSON()
    outdated.forEach(p => {
      if (pkg.dependencies[p.name]) next.dependencies[p.name] = `^${p.version}`
      else if (pkg.devDependencies[p.name])
        next.devDependencies[p.name] = `v${p.version}`
      else if (pkg.peerDependencies[p.name])
        next.peerDependencies[p.name] = `v${p.version}`
    })

    writeFileSync(`${pkg.location}/package.json`, JSON.stringify(next, null, 2))
  }
})

if (warned) {
  process.exit(1)
}
