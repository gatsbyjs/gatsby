const detectPort = require(`detect-port`)
const report = require(`gatsby-cli/lib/reporter`)
const prompts = require(`prompts`)

const detectPortInUseAndPrompt = async port => {
  let foundPort = port
  const detectedPort = await detectPort(port).catch(err => report.panic(err))
  if (port !== detectedPort) {
    process.stdout.write(`\nSomething is already running at port ${port}\n`)
    const response = await prompts({
      type: `confirm`,
      name: `newPort`,
      message: `Would you like to run the app at another port instead?`,
      initial: true,
    })
    if (response.newPort) {
      foundPort = detectedPort
    } else {
      return Promise.reject(`USER_REJECTED`)
    }
  }
  return foundPort
}

module.exports = detectPortInUseAndPrompt
