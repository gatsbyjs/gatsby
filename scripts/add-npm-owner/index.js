#!/usr/bin/env node
const util = require(`util`)
const exec = util.promisify(require(`child_process`).exec)
const argv = require(`yargs`)
  .command(`$0 <user>`, `Add new owner to gatsby packages`)
  .help().argv
const getUnownedPackages = require(`../get-unowned-packages`)

const user = argv.user

getUnownedPackages({ user }).then(async ({ packages }) => {
  if (!packages.length) {
    console.log(`${user} has write access to all packages`)
    return
  } else {
    console.log(`Will be adding ${user} to packages:`)
    packages.forEach(pkg => {
      console.log(` - ${pkg.name}`)
    })
  }

  for (const pkg of packages) {
    const cmd = `npm owner add ${user} ${pkg.name}`
    try {
      const { stderr } = await exec(cmd)
      if (stderr) {
        console.error(`Error adding ${user} to ${pkg.name}:\n`, stderr)
      } else {
        console.log(`Added ${user} to ${pkg.name}`)
      }
    } catch (e) {
      console.error(`Error adding ${user} to ${pkg.name}:\n`, e.stderr)
    }
  }
})
