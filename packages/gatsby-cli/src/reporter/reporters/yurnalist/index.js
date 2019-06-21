// @flow

const { createReporter } = require(`yurnalist`)
const ProgressBar = require(`progress`)
const calcElapsedTime = require(`../../../util/calc-elapsed-time`)

const VERBOSE = process.env.gatsby_log_level === `verbose`
const reporter = createReporter({ emoji: true, verbose: VERBOSE })

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
    let start

    if (activity.type === `spinner`) {
      const spinner = reporter.activity()
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

    if (activity.type === `progress`) {
      const bar = new ProgressBar(
        ` [:bar] :current/:total :elapsed s :percent ${activity.id}`,
        {
          total: 0,
          width: 30,
          clear: true,
        }
      )
      return {
        update: newState => {
          if (newState.startTime) {
            start = newState.startTime
          }
          if (newState.total) {
            bar.total = newState.total
          }
          if (newState.current) {
            bar.tick()
          }
        },
        done: () => {
          reporter.success(
            `${activity.id} — ${bar.curr}/${bar.total} - ${calcElapsedTime(
              start
            )} s`
          )
        },
      }
    }

    return {
      update: () => {},
      done: () => {},
    }
  },
}
