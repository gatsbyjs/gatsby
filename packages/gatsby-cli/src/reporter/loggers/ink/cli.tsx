import * as React from "react"
import { Box, Static } from "ink"
import { isTTY } from "../../../util/is-tty"
import { trackBuildError } from "gatsby-telemetry"

import Spinner from "./components/spinner"
import ProgressBar from "./components/progress-bar"
import Message from "./components/messages"
import Error from "./components/error"
import Develop from "./components/develop"

const showProgress = isTTY()

interface Activity {
  status: string
  id: string
  text: string
  total: number
  current: number
  startTime: [number, number]
}

interface Props {
  logs: {
    messages: { level: string }[]
    activities: Activity[]
  }
  showStatusBar: boolean
}

interface State {
  hasError: boolean
  error: {
    message: string
  }
}

class CLI extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: {
      message: ''
    }
  }

  memoizedReactElementsForMessages: JSX.Element[] = []

  componentDidCatch(error, info): void {
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

    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Box flexDirection="row">
          <Message
            level="ACTIVITY_FAILED"
            text={`We've encountered an error: ${this.state.error.message}`}
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

    const spinners: Activity[] = []
    const progressBars: Activity[] = []

    if (showProgress) {
      Object.keys(activities).forEach(function callbackfn(activityName): void {
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

          {progressBars.map(function callbackfn(activity) {
            return (
            <ProgressBar
              key={activity.id}
              message={activity.text}
              total={activity.total}
              current={activity.current}
              startTime={activity.startTime}
            />
          )})}
        </Box>
        {showStatusBar && <Develop />}
      </Box>
    )
  }
}

export default CLI
