import { onLogAction } from "../../redux/index"
import {
  Actions,
  LogLevels,
  ActivityLogLevels,
  ActivityTypes,
} from "../../constants"

const { createReporter } = require(`yurnalist`)
const ProgressBar = require(`progress`)
const chalk = require(`chalk`)

const yurnalist = createReporter({ emoji: true, verbose: true })

const activities = {}

const levelToYurnalist = {
  [LogLevels.Log]: yurnalist.log.bind(yurnalist),
  [LogLevels.Warning]: yurnalist.warn.bind(yurnalist),
  [LogLevels.Error]: yurnalist.error.bind(yurnalist),
  [LogLevels.Info]: yurnalist.info.bind(yurnalist),
  [LogLevels.Success]: yurnalist.success.bind(yurnalist),
  [ActivityLogLevels.Success]: yurnalist.success.bind(yurnalist),
  [ActivityLogLevels.Failed]: text => {
    yurnalist.log(`${chalk.red(`failed`)} ${text}`)
  },
  [ActivityLogLevels.Interrupted]: text => {
    yurnalist.log(`${chalk.gray(`not finished`)} ${text}`)
  },
}

onLogAction(action => {
  switch (action.type) {
    case Actions.Log: {
      const yurnalistMethod = levelToYurnalist[action.payload.level]
      if (!yurnalistMethod) {
        process.stdout.write(`NO "${action.payload.level}" method\n`)
      } else {
        let message = action.payload.text
        if (action.payload.duration) {
          message += ` - ${action.payload.duration.toFixed(3)}s`
        }
        if (action.payload.statusText) {
          message += ` - ${action.payload.statusText}`
        }
        yurnalistMethod(message)
      }
      break
    }
    case Actions.StartActivity: {
      if (action.payload.type === ActivityTypes.Spinner) {
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
      } else if (action.payload.type === ActivityTypes.Progress) {
        const fmt = text =>
          ` [:bar] :current/:total :elapsed s :percent ${text}`
        const bar = new ProgressBar(fmt(action.payload.text), {
          total: action.payload.total,
          curr: action.payload.current,
          width: 30,
          clear: true,
        })

        activities[action.payload.id] = {
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
    case Actions.UpdateActivity: {
      const activity = activities[action.payload.id]
      if (activity && activity.update) {
        activity.update(action.payload)
      }
      break
    }
    case Actions.EndActivity: {
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
