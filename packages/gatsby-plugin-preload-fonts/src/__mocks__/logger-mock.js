const logLevels = {
  info: 0,
  debug: 1,
  warning: 2,
  error: 3,
  silent: 4,
}

function noop() {}

module.exports = (level = `info`) => {
  const logLevel = logLevels[level]

  return {
    setAdapter: jest.fn(),
    resetAdapter: jest.fn(),
    newline: jest.fn(),
    info: logLevel <= logLevels.info ? jest.fn() : noop,
    debug: logLevel <= logLevels.debug ? jest.fn() : noop,
    warning: logLevel <= logLevels.warning ? jest.fn() : noop,
    error: logLevel <= logLevels.error ? jest.fn() : noop,
    print: jest.fn(),
    fatal: jest.fn(),
    ask: jest.fn(),
    confirm: jest.fn(),
  }
}
