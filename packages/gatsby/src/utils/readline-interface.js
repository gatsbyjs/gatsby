/* @flow */
const readline = require(`readline`)

type ReadlineOptions = {
  input: NodeJS.ReadStream,
  output: NodeJS.WriteStream,
  terminal: boolean,
  historySize: ?number,
  prompt: ?string,
  crlfDelay: ?number,
  removeHistoryDuplicates: ?boolean,
  escapeCodeTimeout: ?number,
}

const defaultIntfcOpts: ReadlineOptions = {
  input: process.stdin,
  output: process.stdout,
  terminal: false,
}

/**
 * Spins up and returns a readline interface
 * @param {ReadlineOptions} opts
 */
function create(opts: ?ReadlineOptions) {
  const rlOpts = {
    ...defaultIntfcOpts,
    ...opts,
  }

  const stdin = rlOpts.input
  const stdout = rlOpts.output

  if (!stdin || (stdin !== process.stdin && !stdin.isTTY)) {
    throw new Error(`Invalid stream passed`)
  }
  if (!stdout || (stdout !== process.stdout && !stdout.isTTY)) {
    throw new Error(`Invalid output passed`)
  }

  const rl = readline.createInterface({
    ...defaultIntfcOpts,
    ...opts,
  })

  // const isRaw = stdin.isRaw
  // if (stdin.isTTY) stdin.setRawMode(true)

  // Save a reference to the original
  // close function, so we can call it later
  const rlClose = rl.close

  const close = () => {
    // if (stdin.isTTY) stdin.setRawMode(isRaw)
    rl.pause()
    rlClose()
  }
  // Overloading the close interface, so we
  // can inject some custom behavior
  rl.close = close

  // rl.resume()

  return rl
}

// const ask = rl => (query: any, cb: (answer: any) => void) => {
//   rl.setPrompt(query)
//   rl.prompt()
//   rl.on(`line`, input => {
//     cb(input.trim())
//   })
// }

const prompt = {
  /**
   * Create a new readline dedicated to providing the question
   * interface
   * @param {ReadlineOptions} rlOpts Options to override readline interface
   * with
   */
  new: async (rlOpts: ?ReadlineOptions) => {
    const rl = create(rlOpts)
    return {
      // ask: ask(rl),
      ask: rl.question,
      done: rl.close,
    }
  },
  /**
   * Creates a new readline interface for a one-time prompt, then closes it.
   * @param {string} query The question to ask the user
   * @param {(answer: any) => void} cb The callback that will receive the user's
   * input
   * @param {ReadlineOptions} rlOpts Options to override the readline interface
   */
  once: (
    query: string,
    cb: (answer: any) => void,
    rlOpts: ?ReadlineOptions
  ) => {
    const rl = create(rlOpts)
    rl.question(query, answer => {
      rl.close()
      cb(answer)
    })
    // ask(rl)(query, answer => {
    //   cb(answer)
    //   rl.close()
    // })
  },
}

module.exports = {
  create,
  prompt,
  // extend features here
}
