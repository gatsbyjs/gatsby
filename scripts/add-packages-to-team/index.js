#!/usr/bin/env node
// const util = require(`util`)
// const exec = util.promisify(require(`child_process`).exec)
const argv = require(`yargs`)
  .command(`$0`, `Add new owner to gatsby packages`, {
    user: {
      default: `@gatsbyjs:ink-team`,
    },
  })
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

  // seems like the cli only supports users and no teams yet. The website does.
  // Atm I get this error "This command is only available for scoped packages." with npm 6.9.0
  // for (let pkg of packages) {
  //   const cmd = `npm access grant read-write ${user} ${pkg.name}`
  //   try {
  //     const { stderr } = await exec(cmd)
  //     if (stderr) {
  //       console.error(`Error adding ${user} to ${pkg.name}:\n`, stderr)
  //     } else {
  //       console.log(`Added ${user} to ${pkg.name}`)
  //     }
  //   } catch (e) {
  //     console.error(`Error adding ${user} to ${pkg.name}:\n`, e.stderr)
  //   }
  // }

  // get all packages as json format, you can use this do to a foreach in the console and capture the fetch request.
  // const packages = 'list of packages';
  // packages.forEach(package => {
  //   fetch("https://www.npmjs.com/settings/gatsbyjs/teams/team/ink-team/access", <this need to be custom to your session & use the package here>);
  // })
  console.log(
    JSON.stringify(
      packages.map(pkg => pkg.name),
      null,
      2
    )
  )
})
