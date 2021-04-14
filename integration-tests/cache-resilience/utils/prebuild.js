const { selectConfiguration } = require(`./select-configuration`)

if (!process.env.CONFIG_SETUP) {
  console.warn(
    `CONFIG_SETUP env var was not setup. Defaulting to "1". Available options are "1" and "2"`
  )
  process.env.CONFIG_SETUP = `1`
}

const run = selectConfiguration(parseInt(process.env.CONFIG_SETUP))
console.log(`Prepared setup #${run}`)
