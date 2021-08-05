const { writeFileSync } = require(`fs`)
const yargs = require(`yargs`)
const { getPackages } = require(`@lerna/project`)
const PackageGraph = require(`@lerna/package-graph`)
const semver = require(`semver`)

let warned = false
const argv = yargs
  .option(`fix`, {
    default: false,
    describe: `Fixes outdated dependencies`,
  })
  .option(`allow-next`, {
    default: false,
    describe: `Allow using "next" versions. Use this only for alpha/beta releases`,
  }).argv

getPackages(process.cwd()).then(packages => {
  const graph = new PackageGraph(packages, `allDependencies`, true)

  graph.forEach((pkgNode, name) => {
    let outdated = Array.from(pkgNode.localDependencies.values()).filter(
      localDep =>
        !semver.satisfies(graph.get(localDep.name).version, localDep.fetchSpec)
    )

    if (argv[`allow-next`]) {
      outdated = outdated.filter(localDep => localDep.fetchSpec !== `next`)
    }

    if (!outdated.length) return

    const msg = outdated
      .map(
        p =>
          `  Depends on "${p.name}@${p.fetchSpec}" \n` +
          `  instead of "${p.name}@${graph.get(p.name).version}". \n`
      )
      .join(`\n`)

    console.error(`${pkgNode.name}: \n${msg}`)
    warned = true

    if (argv.fix) {
      const pkg = pkgNode.pkg
      const next = pkg.toJSON()
      const depTypes = [`dependencies`, `devDependencies`, `peerDependencies`]
      outdated.forEach(p => {
        depTypes.forEach(depKey => {
          if (pkg[depKey] && pkg[depKey][p.name]) {
            next[depKey][p.name] = `^${graph.get(p.name).version}`
          }
        })
      })

      writeFileSync(
        `${pkg.location}/package.json`,
        JSON.stringify(next, null, 2)
      )
    }
  })

  if (warned) {
    process.exit(1)
  }
})
