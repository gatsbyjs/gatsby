const Repository = require(`lerna/lib/Repository`)

const repo = new Repository()
let warned = false

repo.packages.forEach(pkg => {
  const outdated = repo.packages
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
})

if (warned) {
  process.exit(1)
} else {
  console.log(`All packages depend on the most current local versions`)
}

