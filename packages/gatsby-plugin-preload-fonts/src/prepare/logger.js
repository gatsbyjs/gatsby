const chalk = require(`chalk`)
const readline = require(`readline`)

function noop() {}

const logLevels = {
  info: 0,
  debug: 1,
  warn: 2,
  error: 3,
  silent: 4,
}

const getPrompt = (promptOrInfo, prompt) => {
  let info
  if (!prompt) prompt = promptOrInfo
  else info = promptOrInfo

  if (info) console.log(info)

  return prompt
}

module.exports = level => {
  let logLevel = logLevels[level]
  if (typeof logLevel === `undefined`) logLevel = logLevels.error

  const question = prompt =>
    new Promise(resolve => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      rl.question(prompt, res => {
        rl.close()
        resolve(res)
      })
    })

  let adapter = console.log
  const setAdapter = a => (adapter = a)
  const resetAdapter = () => (adapter = console.log)

  const prepend =
    tag =>
    (...args) =>
      adapter(tag, ...args)

  return {
    setAdapter,
    resetAdapter,
    newline: () => adapter(),
    info: logLevel <= logLevels.info ? prepend(chalk.white(`[info]`)) : noop,
    debug: logLevel <= logLevels.debug ? prepend(chalk.blue(`[debug]`)) : noop,
    warn: logLevel <= logLevels.warn ? prepend(chalk.yellow(`[warn]`)) : noop,
    error: logLevel <= logLevels.error ? prepend(chalk.red(`[error]`)) : noop,
    print: (...args) => adapter(...args),
    fatal: (...args) => adapter(...args) || process.exit(1),
    confirm: async (promptOrInfo, prompt) => {
      if (!process.stdout.isTTY) return false

      prompt = getPrompt(promptOrInfo, prompt)

      let res = ``
      while (!/(y|n|yes|no)/i.test(res)) {
        res = await question(`${prompt} ${chalk.bold(`[y/n]`)} `)
      }

      // print newline
      adapter()

      return /(y|yes)/i.test(res)
    },
  }
}
