import React from "react"
import { Static, Box } from "ink"
import chalk from "chalk"
import Spinner from "./components/spinner"
import ProgressBar from "./components/progress-bar"
import Develop from "./components/develop"
import { Message } from "./components/messages"

import Error from "./components/error"

import isTTY from "../../../util/is-tty"
import calcElapsedTime from "../../../util/calc-elapsed-time"

const showProgress = isTTY

const successTextGenerator = {
  spinner: activity => {
    let successText = `${activity.id} - ${calcElapsedTime(
      activity.startTime
    )} s`
    if (activity.status) {
      successText += ` — ${activity.status}`
    }

    return successText
  },
  progress: activity =>
    `${activity.id} — ${activity.current}/${activity.total} - ${calcElapsedTime(
      activity.startTime
    )} s`,
}

export default class GatsbyReporter extends React.Component {
  verbose = process.env.gatsby_log_level === `verbose`
  state = {
    verbose: false,
    messages: [],
    activities: {},
    stage: { stage: `init`, context: {} },
  }

  format = chalk

  setStage = stage => {
    this.setState({ stage })
  }

  createActivity = ({ id, ...options }) => {
    this.setState(state => {
      return {
        activities: {
          ...state.activities,
          [id]: {
            id,
            ...options,
          },
        },
      }
    })

    return {
      update: newState => {
        this.setState(state => {
          return {
            activities: {
              ...state.activities,
              [id]: {
                ...state.activities[id],
                ...newState,
              },
            },
          }
        })
      },
      done: () => {
        const activity = this.state.activities[id]
        this.success(successTextGenerator[activity.type]({ id, ...activity }))

        this.setState(state => {
          const activities = { ...state.activities }
          delete activities[id]

          return {
            activities,
          }
        })
      },
    }
  }

  setColors(useColors = false) {
    this.setState({
      disableColors: !useColors,
    })
  }

  setVerbose(isVerbose = true) {
    this.verbose = isVerbose
  }

  _addMessage(type, details) {
    // threat null/undefind as an empty character, it seems like ink can't handle empty str
    if (!details) {
      details = `\u2800`
    }

    const msg = { type, details }

    this.setState(state => {
      return {
        messages: [...state.messages, msg],
      }
    })
  }

  log = this._addMessage.bind(this, null)
  info = this._addMessage.bind(this, `info`)
  success = this._addMessage.bind(this, `success`)
  warn = this._addMessage.bind(this, `warn`)
  error = this._addMessage.bind(this, `error`)
  verbose = str => {
    if (!this.verbose) {
      return
    }

    this._addMessage(`verbose`, str)
  }

  render() {
    const { activities, messages, disableColors, stage } = this.state

    const spinners = []
    const progressBars = []
    if (showProgress) {
      Object.keys(activities).forEach(activityName => {
        const activity = activities[activityName]
        if (activity.type === `spinner`) {
          spinners.push(activity)
        }
        if (activity.type === `progress` && activity.startTime) {
          progressBars.push(activity)
        }
      })
    }

    return (
      <Box flexDirection="column">
        <Box flexDirection="column">
          <Static>
            {messages.map((msg, index) => (
              <Box textWrap="wrap" key={index}>
                {msg.type === `error` ? (
                  <Error type={msg.type} details={msg.details} />
                ) : (
                  <Message type={msg.type} hideColors={disableColors}>
                    {msg.details}
                  </Message>
                )}
              </Box>
            ))}
          </Static>

          {spinners.map(activity => (
            <Spinner key={activity.id} name={activity.id} {...activity} />
          ))}

          {progressBars.map(activity => (
            <ProgressBar
              key={activity.id}
              message={activity.id}
              total={activity.total}
              current={activity.current}
              startTime={activity.startTime}
            />
          ))}
        </Box>
        {stage.stage === `DevelopBootstrapFinished` && (
          <Develop stage={stage} />
        )}
      </Box>
    )
  }
}
