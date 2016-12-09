import detect from 'detect-port'
import chalk from 'chalk'
import getProcessForPort from './getProcessForPort'
import rl from 'readline'

const rlInterface = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
})

module.exports = (startServer) => (program) => {
  const port = typeof program.port === 'string'
    ? parseInt(program.port, 10)
    : program.port

  const existingProcess = getProcessForPort(port)

  detect(port, (err, _port) => {
    if (err) {
      console.error(err)
      process.exit()
    }

    if (port !== _port) {
      // eslint-disable-next-line max-len
      const question = chalk.yellow(`Something is already running on port ${port}.\n${(existingProcess) ? ` Probably:\n  ${existingProcess}\n` : ''}\nWould you like to run the app at another port instead? [Y/n]`)

      return rlInterface.question(question, (answer) => {
        if (answer.length === 0 || answer.match(/^yes|y$/i)) {
          program.port = _port // eslint-disable-line no-param-reassign
        }

        return startServer(program)
      })
    }

    return startServer(program)
  })
}
