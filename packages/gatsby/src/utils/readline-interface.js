/* @flow */
const readline = require(`readline`)
const MuteStream = require(`mute-stream`)

type ReadlineOptions = {
  historySize: ?number,
  prompt: ?string,
  crlfDelay: ?number,
  removeHistoryDuplicates: ?boolean,
  escapeCodeTimeout: ?number,
}

type InternalOptions = {
  input: NodeJS.ReadStream,
  output: NodeJS.WriteStreamm,
  terminal: boolean,
  ...ReadlineOptions,
}

type AskOpts = {
  single: ?boolean,
  validInput: ?(string[]),
  defaultValue: ?string,
  returnBoolean: ?{
    trueValue: string,
  },
}

type KeypressKey = {
  sequence: string,
  name: string,
  ctrl: boolean,
  meta: boolean,
  shift: boolean,
}

type CanListen = "input"
type ListenerTypes = "all" | "input" | "rl"

type ListenerCache = {
  rl: {
    line: Function[],
  },
  input: {
    keypress: Function[],
  },
}

/**
 * Collection of various readline utility functions
 */
const RlUtil = {
  showCursor(rl) {
    rl.output.write(`\x1B[?25h`)
  },
  hideCursor(rl) {
    rl.output.write(`\x1B[?25l`)
  },
  cursorHome(rl) {
    readline.cursorTo(rl.output, 0)
  },
  cursorUp(rl, n = -1) {
    readline.moveCursor(rl.output, 0, n)
  },
  cursorDown(rl, n = 1) {
    readline.moveCursor(rl.output, 0, n)
  },
  cursorLeft(rl, n = -1) {
    readline.moveCursor(rl.output, n, 0)
  },
  cursorRight(rl, n = 1) {
    readline.moveCursor(rl.output, n, 0)
  },
  clearLine(rl) {
    readline.clearLine(rl.output, 0)
  },
  clearScreen(rl) {
    readline.cursorTo(rl.output, 0, 0)
    readline.clearScreenDown(rl.output)
  },
  ceol(rl) {
    readline.clearLine(rl.output, 1)
  },
  ceos(rl) {
    readline.clearScreenDown(rl.output)
  },
}

/**
 * Spins up and returns a readline interface, for tty IO ONLY!
 * Using this function will give you a nearly barebones readline interface
 * It does, however, manage the IO streams for you, and provides some readline
 * overloads for utility functions
 * @param {ReadlineOptions} opts Readline option overrides
 * @returns {[readline.Interface, done]} Returns a tuple containing the readline
 * interface, and the teardown method
 */
const create = (opts: ?ReadlineOptions): [readline.Interface, () => void] => {
  const stdin = process.stdin
  const stdout = process.stdout
  const msIn = new MuteStream()
  const msOut = new MuteStream()
  const isRaw = stdin.isRaw
  const isTTY = stdin.isTTY
  const listeners: ListenerCache = {
    input: {
      keypress: [],
    },
    rl: {
      line: [],
    },
  }

  const defaultPrompt = (opts && opts.prompt) || ``
  let promptLnCount = defaultPrompt.split(`\n`).length

  stdin.pipe(msIn)
  msOut.pipe(stdout)
  msIn.unmute()
  msOut.unmute()

  const rlOpts: InternalOptions = {
    ...opts,
    input: msIn,
    output: msOut,
    terminal: true,
  }
  const rl = readline.createInterface(rlOpts)

  /**
   * Call `done()` to break down the readline interface
   */
  const done = () => {
    rl.setRaw(isRaw)
    rl.removeListeners()
    rl.pause()
    rl.close()
  }

  rl.on(`SIGINT`, () => {
    done()
    process.exit()
  })

  rl.setRaw = (rawMode = true) => {
    if (rl.isTTY) stdin.setRawMode(rawMode)
  }

  /**
   * Listen for keypress events, to read each keystroke
   */
  rl.listen = (keypress: (chunk: string, key: KeypressKey) => void) => {
    // Can only listen for keypress on tty input streams
    if (rl.isTTY) {
      rl.setRaw()
      readline.emitKeypressEvents(rl.input, rl)
      rl.input.unmute()
      rl.addListener(`input`, `keypress`, keypress)
    }
  }

  rl.addListener = (type: CanListen, event: string, handler: Function) => {
    if (!listeners[type][event]) listeners[type][event] = []
    rl[type].on(event, handler)
    listeners[type][event].push(handler)
  }

  rl.removeListeners = (type: ListenerTypes = `all`) => {
    const removeInputListeners = () => {
      Object.keys(listeners.input).forEach(event => {
        while (listeners.input[event].length > 0) {
          const func = listeners.input[event].pop()
          if (func) rl.input.removeListener(event, func)
        }
      })
    }
    const removeAll = () => {
      removeInputListeners()
      rl.removeAllListeners()
    }
    switch (type) {
      case `all`: {
        removeAll()
        break
      }
      case `input`: {
        removeInputListeners()
        break
      }
    }
  }

  rl._setPrompt = rl.setPrompt
  rl.setPrompt = (newPrompt: string) => {
    promptLnCount = newPrompt.split(`\n`).length
    rl._setPrompt(newPrompt)
  }

  rl.resetPrompt = () => {
    rl.setPrompt(defaultPrompt)
  }

  rl.clearPrompt = (offset = 0) => {
    RlUtil.cursorHome(rl)
    RlUtil.cursorUp(rl, offset)
    for (let x = 0; x < promptLnCount; ++x) {
      RlUtil.clearLine(rl)
      RlUtil.cursorUp(rl)
    }
  }

  rl.isTTY = isTTY && stdin.setRawMode

  rl.resume()

  return [rl, done]
}

/**
 * This function will prompt the user with a specific question.
 * @param {readline.Interface} rl The readline interface to use for the prompts
 * @returns {(query, cb, askOpts: AskOptions) => void} Call this interface to generate the prompt
 * * `query`: The question to ask the user
 * * `cb`: The function to pass the answer to
 * * `askOpts`: A collection of options to refine the experience of the prompts
 * * * `single`: boolean; accept only single characters for input
 * * * `validInput`: string[]; collection of valid inputs.  If not defined, any input is considered valid
 * * * `defaultInput`: string; Value to choose if the user enters a null value (return key)
 * * * `returnBoolean`: { trueValue: string }; If defined, then `cb()` will be called with a boolean value.
 * If input matches `trueValue` then `cb(true)`, otherwise `cb(false)`.
 */
const ask = (rl: readline.Interface) => (
  query: any,
  cb: (answer: any) => void,
  askOpts: ?KeyInOptions = {}
) => {
  if (askOpts && askOpts.single) {
    if (!rl.isTTY) askOpts.single = false
  }
  const opts: AskOpts = {
    single: false,
    ...askOpts,
  }

  RlUtil.showCursor(rl)

  const validateInput = (input): boolean => {
    let good = true
    let answer = input.toString()
    let sensitivity = `i`
    if (input.length === 0) {
      answer = opts.defaultValue || ``
    }
    if (opts.validInput) {
      good = opts.validInput.some(val =>
        new RegExp(`^${answer}$`, sensitivity).test(val.toString())
      )
    }
    if (good) {
      if (opts.returnBoolean) {
        if (
          new RegExp(`^${answer}$`, sensitivity).test(
            opts.returnBoolean.trueValue
          )
        ) {
          answer = true
        } else {
          answer = false
        }
      }
      cb(answer)
    }
    return good
  }

  const onKeypress = (chunk: string, key: KeypressKey): KeypressKey => {
    if (key.ctrl && key.name === `c`) {
      rl.emit(`SIGINT`)
    } else if (key.name === `return` && opts.single) {
      chunk = opts.defaultValue || ``
      key.name = chunk
    } else if (key.ctrl || key.alt) {
      return void 0
    }
    if (opts.single) {
      if (validateInput(chunk)) {
        rl.output.unmute()
        rl.output.write(`${chunk}\n`)
        rl.removeListeners(`input`)
      } else {
        return void 0
      }
    }
    return key
  }

  rl.setPrompt(query)
  rl.listen(onKeypress)
  rl.prompt()
  if (opts.single) {
    rl.output.mute()
  } else {
    rl.on(`line`, data => {
      if (!validateInput(data)) {
        rl.clearPrompt(2)
        rl.prompt()
      }
    })
  }
}

const prompt = {
  /**
   * Create a new readline dedicated to providing the question
   * interface
   * @param {ReadlineOptions} rlOpts Options to override readline interface
   * with
   */
  new: (rlOpts: ?ReadlineOptions) => {
    const [rl, done] = create(rlOpts)
    return {
      ask: ask(rl),
      done,
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
    askOpts: ?AskOpts,
    rlOpts: ?ReadlineOptions
  ) => {
    const [rl, done] = create(rlOpts)
    const _cb = answer => {
      cb(answer)
      done()
    }
    ask(rl)(query, _cb, askOpts)
  },
}

module.exports = {
  create,
  prompt,
  // extend features here
}
