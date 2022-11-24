const { exec } = require(`child_process`)

const grepJSFilesFor = (str, pathToGrep) =>
  new Promise(resolve => {
    const grep = exec(`grep -r "${str}" ${pathToGrep}`)

    grep.stdout.on(`data`, data => {
      resolve(true)
      return
    })

    grep.on(`close`, () => {
      resolve(false)
      return
    })
  })

const checkLeakedEnvVar = async () => {
  const isLeaked =
    // we want to make sure unused VERY_SECRET_VAR doesn't end up in js bundles
    (await grepJSFilesFor(`VERY_SECRET_VAR`, `./public/*.js`)) ||
    // additionally we want to verify that its value don't end up anywhere in public dir
    (await grepJSFilesFor(`it's a secret`, `./public`))

  if (isLeaked) {
    console.error(`Error: VERY_SECRET_VAR found in bundle`)
    process.exit(1)
  } else {
    console.log(`Success: VERY_SECRET_VAR not found in bundle`)
    process.exit(0)
  }
}

checkLeakedEnvVar()
