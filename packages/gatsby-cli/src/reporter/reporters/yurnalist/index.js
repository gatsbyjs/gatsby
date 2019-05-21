// @flow

const { createReporter } = require(`yurnalist`)
const convertHrtime = require(`convert-hrtime`)
const ProgressBar = require(`progress`)

const VERBOSE = process.env.gatsby_log_level === `verbose`
const reporter = createReporter({ emoji: true, verbose: VERBOSE })

const calcElapsedTime = startTime => {
  const elapsed = process.hrtime(startTime)

  return convertHrtime(elapsed)[`seconds`].toFixed(3)
}

/**
 * Reporter module.
 * @module reporter
 */
module.exports = {
  /**
   * Toggle verbosity.
   * @param {boolean} [isVerbose=true]
   */
  setVerbose(isVerbose = true) {
    reporter.isVerbose = !!isVerbose
  },
  /**
   * Turn off colors in error output.
   */
  setColors() {},

  success: reporter.success.bind(reporter),
  error: reporter.error.bind(reporter),
  verbose: reporter.verbose.bind(reporter),
  info: reporter.info.bind(reporter),
  warn: reporter.warn.bind(reporter),
  log: reporter.log.bind(reporter),

  createActivity: activity => {
    if (activity.type === 'spinner') {
      const spinner = reporter.activity();
      let start
      let status

      return {
        update: newState => {
          if (newState.startTime) {
            start = newState.startTime
            spinner.tick(activity.id)
          }
          if (newState.status) {
            status = newState.status
            spinner.tick(`${activity.id} — ${newState.status}`)
          }
        },
        done: () => {
          const str = status
            ? `${activity.id} — ${calcElapsedTime(start)} — ${status}`
            : `${activity.id} — ${calcElapsedTime(start)}`
          reporter.success(str)
          spinner.end()
        },
      }
    }

    if (activity.type === 'progress') {
      const bar = new ProgressBar(
        ` [:bar] :current/:total :elapsed secs :percent ${activity.id}`,
        {
          total: 0,
          width: 30,
        }
      )
      return {
        update: newState => {
          if (newState.total) {
            bar.total = newState.total
          }
          if (newState.current) {
            bar.tick()
          }
        },
        done: () => {
          reporter.success(`${activity.id} — ${activity.current}/${activity.total} - ${calcElapsedTime(
            activity.startTime
          )} s`)
        },
      }
    }
  },
}
