const StackUtils = require(`stack-utils`)

module.exports = tags => {
  if (!tags) return
  const { error } = tags
  if (error) {
    try {
      ;[].concat(error).forEach(e => {
        ;[`envPairs`, `options`, `output`].forEach(f => delete e[f])
        // These may be buffers
        if (e.stderr) e.stderr = String(e.stderr)
        if (e.stdout) e.stdout = String(e.stdout)
        let { stack } = e
        if (stack) {
          const stackUtils = new StackUtils({
            cwd: process.cwd(),
            internals: StackUtils.nodeInternals(),
          })
          stack = stackUtils.clean(stack)
          e.stack = stack
        }
        return e
      })
    } catch (err) {
      // ignore
    }
  }
}
