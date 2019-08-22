const detectPort = require(`detect-port`)
const report = require(`gatsby-cli/lib/reporter`)
const prompt = require(`./readline-interface`).prompt
// const readlineSync = require(`readline-sync`)

const readlinePort = port => {
  const question = `Something is already running at port ${port} \nWould you like to run the app at another port instead? [Y/n] `
  return new Promise(resolve => {
    prompt.once(question, answer => {
      resolve(answer.length === 0 || answer.match(/^yes|y$/i))
    })
    // const interrupt = () => {
    //   process.exit(0)
    // }
    // process.on(`SIGINT`, interrupt)
    // const answer = readlineSync.keyIn(question, {
    //   limit: [`y`, `n`, ``],
    //   defaultInput: `y`,
    //   caseSensitive: false,
    //   trueValue: [`y`],
    //   falseValue: [`n`],
    // })
    // process.removeListener(`SIGINT`, interrupt)
    // resolve(answer)
  })
}

const detectPortInUseAndPrompt = async port => {
  let foundPort = port
  const detectedPort = await detectPort(port).catch(err => report.panic(err))
  if (port !== detectedPort) {
    if (await readlinePort(port)) {
      foundPort = detectedPort
    } else {
      return Promise.reject(`USER_REJECTED`)
    }
  }
  return foundPort
}

module.exports = detectPortInUseAndPrompt
