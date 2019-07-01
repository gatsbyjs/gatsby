import { onLogAaction } from "../../redux/index"

const { createReporter } = require(`yurnalist`)
const ProgressBar = require(`progress`)

const yurnalist = createReporter({ emoji: true, verbose: true })

const activities = {}

const levelToYurnalist = {
  LOG: `log`,
  WARNING: `warn`,
  ERROR: `error`,
  INFO: `info`,
  SUCCESS: `success`,
}

onLogAaction(action => {
  switch (action.type) {
    case `STATEFUL_LOG`:
    case `STRUCTURED_LOG`: {
      const yurnalistMethod = levelToYurnalist[action.payload.level]
      yurnalist[yurnalistMethod](action.payload.text)
      break
    }
    case `STRUCTURED_ACTIVITY_START`: {
      if (action.payload.type === `spinner`) {
        const spinner = yurnalist.activity()
        spinner.tick(action.payload.name)
        activities[action.payload.name] = {
          name: action.payload.name,
          update: payload =>
            spinner.tick(`${payload.name} - ${payload.status}`),
          end: () => {
            spinner.end()
          },
        }
      } else if (action.payload.type === `progress`) {
        const bar = new ProgressBar(
          ` [:bar] :current/:total :elapsed s :percent ${action.payload.name}`,
          {
            total: action.payload.total,
            width: 30,
            clear: true,
          }
        )

        activities[action.payload.name] = {
          tick: () => {
            bar.tick()
          },
          update: payload => {
            if (payload.total) {
              bar.total = payload.total
            }
          },
          end: () => {},
        }
      }
      break
    }
    case `STRUCTURED_ACTIVITY_UPDATE`: {
      const activity = activities[action.payload.name]
      if (activity && activity.update) {
        activity.update(action.payload)
      }
      break
    }
    case `STRUCTURED_ACTIVITY_TICK`: {
      const activity = activities[action.payload.name]
      if (activity && activity.tick) {
        activity.tick()
      }
      break
    }
    case `STRUCTURED_ACTIVITY_END`: {
      const activity = activities[action.payload.name]
      if (activity) {
        let text = action.payload.name
        if (action.payload.status) {
          text += ` - ${action.payload.status}`
        }
        if (action.payload.elapsedTime) {
          text += ` - ${action.payload.elapsedTime} s`
        }

        yurnalist.success(text)
        if (activity.end) {
          activity.end()
        }
        delete activities[action.payload.name]
      }
    }
  }
})
