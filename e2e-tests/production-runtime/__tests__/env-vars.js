const { exec } = require(`child_process`)

const grepJSFilesFor = str =>
  new Promise(resolve => {
    const grep = exec(`grep -r "${str}" ./public/*.js`)

    grep.stdout.on(`data`, () => {
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
    (await grepJSFilesFor(`VERY_SECRET_VAR`)) ||
    (await grepJSFilesFor(`it's a secret`))

  if (isLeaked) {
    console.error(`Error: VERY_SECRET_VAR found in bundle`)
    process.exit(1)
  } else {
    console.log(`Success: VERY_SECRET_VAR not found in bundle`)
    process.exit(0)
  }
}

checkLeakedEnvVar()
