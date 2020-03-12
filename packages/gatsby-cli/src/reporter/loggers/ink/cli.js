import React from "react"
import { Box, Static } from "ink"
import isTTY from "../../../util/is-tty"
import { trackBuildError } from "gatsby-telemetry"

import { Spinner } from "../ink/components/spinner"
import { ProgressBar } from "../ink/components/progress-bar"
import { Message } from "../ink/components/messages"
import { Error } from "./components/error"
import Develop from "../ink/components/develop"

const showProgress = isTTY()

class CLI extends React.Component {
  state = {
    hasError: false,
  }

  memoizedReactElementsForMessages = []

  componentDidCatch(error, info) {
    trackBuildError(`INK`, {
      error: {
        stack: info.componentStack,
        text: error.message,
        context: {},
      },
    })
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    const {
      logs: { messages, activities },
      showStatusBar,
    } = this.props

    const { hasError, error } = this.state

    if (hasError) {
      // You can render any custom fallback UI
      return (
        <Box flexDirection="row">
          <Message
            level="ACTIVITY_FAILED"
            text={`We've encountered an error: ${error.message}`}
          />
        </Box>
      )
    }

    /*
      Only operation on messages array is to push new message into it. Once
      message is there it can't change. Because of that we can do single
      transform from message object to react element and store it.
      This will avoid calling React.createElement completely for every message
      that can't change.
    */
    if (messages.length > this.memoizedReactElementsForMessages.length) {
      for (
        let index = this.memoizedReactElementsForMessages.length;
        index < messages.length;
        index++
      ) {
        const msg = messages[index]
        this.memoizedReactElementsForMessages.push(
          msg.level === `ERROR` ? (
            <Error details={msg} key={index} />
          ) : (
            <Message key={index} {...msg} />
          )
        )
      }
    }

    const spinners = []
    const progressBars = []
    if (showProgress) {
      Object.keys(activities).forEach(activityName => {
        const activity = activities[activityName]
        if (activity.status !== `IN_PROGRESS`) {
          return
        }
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
          <Static>{this.memoizedReactElementsForMessages}</Static>

          {spinners.map(activity => (
            <Spinner key={activity.id} {...activity} />
          ))}

          {progressBars.map(activity => (
            <ProgressBar
              key={activity.id}
              message={activity.text}
              total={activity.total}
              current={activity.current}
              startTime={activity.startTime}
            />
          ))}
        </Box>
        {showStatusBar && <Develop />}
      </Box>
    )
  }
}

export default CLI
