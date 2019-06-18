const ProgressBar = require(`progress`)
const reporter = require(`gatsby-cli/lib/reporter`)

// TODO remove in V3
export function createProgress(message) {
  if (reporter.createProgress) {
    return reporter.createProgress(message)
  }

  const bar = new ProgressBar(
    ` [:bar] :current/:total :elapsed s :percent ${message}`,
    {
      total: 0,
      width: 30,
      clear: true,
    }
  )

  return {
    start() {},
    tick() {
      bar.tick()
    },
    done() {},
    set total(value) {
      bar.total = value
    },
  }
}
