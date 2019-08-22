const detectPort = require(`detect-port`)
const report = require(`gatsby-cli/lib/reporter`)
const { prompt } = require(`./readline-interface`)

const readlinePort = port => {
  const question = `Something is already running at port ${port} \nWould you like to run the app at another port instead? [Y/n]: `
  return new Promise(resolve => {
    prompt.once(
      question,
      answer => {
        resolve(answer)
      },
      {
        single: false,
        validInput: [`Y`, `n`],
        defaultValue: `y`,
        returnBoolean: {
          trueValue: `y`,
        },
      }
    )
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
