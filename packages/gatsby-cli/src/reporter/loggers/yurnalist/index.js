import { onLogAaction } from "../../redux/index"

const { createReporter } = require(`yurnalist`)
const ProgressBar = require(`progress`)
const chalk = require(`chalk`)

const yurnalist = createReporter({ emoji: true, verbose: true })

const activities = {}

const levelToYurnalist = {
  LOG: yurnalist.log.bind(yurnalist),
  WARNING: yurnalist.warn.bind(yurnalist),
  ERROR: yurnalist.error.bind(yurnalist),
  INFO: yurnalist.info.bind(yurnalist),
  SUCCESS: yurnalist.success.bind(yurnalist),
  ACTIVITY_SUCCESS: yurnalist.success.bind(yurnalist),
  ACTIVITY_FAILED: text => {
    yurnalist.log(`${chalk.red(`failed`)} ${text}`)
  },
}

onLogAaction(action => {
  switch (action.type) {
    case `STATEFUL_LOG`:
    case `LOG`: {
      const yurnalistMethod = levelToYurnalist[action.payload.level]
      if (!yurnalistMethod) {
        process.stdout.write(`NO "${action.payload.level}" method\n`)
      } else {
        let message = action.payload.text
        if (action.payload.duration) {
          message += ` - ${action.payload.duration}s`
        }
        if (action.payload.statusText) {
          message += ` - ${action.payload.statusText}`
        }
        yurnalistMethod(message)
      }
      break
    }
    case `ACTIVITY_START`: {
      if (action.payload.type === `spinner`) {
        const spinner = yurnalist.activity()
        spinner.tick(action.payload.text)
        const activity = {
          text: action.payload.text,
          statusText: action.payload.statusText,
          update: payload => {
            if (payload.text) {
              activity.text = payload.text
            }
            if (payload.statusText) {
              activity.statusText = payload.statusText
            }

            let message = activity.text
            if (activity.statusText) {
              message += ` - ${activity.statusText}`
            }

            message += ` id:"${action.payload.id}"`

            spinner.tick(message)
          },
          end: () => {
            spinner.end()
          },
        }
        activities[action.payload.id] = activity
      } else if (action.payload.type === `progress`) {
        const fmt = text =>
          ` [:bar] :current/:total :elapsed s :percent ${text}`
        const bar = new ProgressBar(fmt(action.payload.text), {
          total: action.payload.total,
          curr: action.payload.current,
          width: 30,
          clear: true,
        })

        activities[action.payload.name] = {
          update: payload => {
            if (payload.total) {
              bar.total = payload.total
            }
            if (payload.current) {
              bar.curr = payload.current
            }
            if (payload.text) {
              bar.fmt = fmt(payload.text)
            }

            bar.tick(0)
          },
          end: () => {},
        }
      }
      break
    }
    case `ACTIVITY_UPDATE`: {
      const activity = activities[action.payload.name]
      if (activity && activity.update) {
        activity.update(action.payload)
      }
      break
    }
    // case `STRUCTURED_ACTIVITY_TICK`: {
    //   const activity = activities[action.payload.name]
    //   if (activity && activity.tick) {
    //     activity.tick()
    //   }
    //   break
    // }
    case `ACTIVITY_END`: {
      const activity = activities[action.payload.id]
      if (activity) {
        if (activity.end) {
          activity.end()
        }
        delete activities[action.payload.id]
      }
    }
  }
})
