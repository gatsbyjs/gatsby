import React from "react"
import { Box, Static } from "ink"
import { isTTY } from "../../../util/is-tty"
import { trackBuildError } from "gatsby-telemetry"
import { Spinner } from "./components/spinner"
import {
  ProgressBar,
  IProps as IProgressbarProps,
} from "./components/progress-bar"
import { Message, IProps as IMessageProps } from "./components/messages"
import { Error as ErrorComponent, IErrorDetails } from "./components/error"
import Develop from "./components/develop"
import {
  ActivityLogLevels,
  ActivityStatuses,
  ActivityTypes,
} from "../../constants"

const showProgress = isTTY()

interface IActivity
  extends Pick<IProgressbarProps, "total" | "current" | "startTime"> {
  id: string
  text: string
  status: ActivityStatuses
  type: ActivityTypes
}

interface IProps {
  logs: {
    messages: Array<IErrorDetails | IMessageProps>
    activities: Record<string, IActivity>
  }
  showStatusBar: boolean
}

interface IState {
  hasError: boolean
  error?: Error
}

class CLI extends React.Component<IProps, IState> {
  readonly state: IState = {
    hasError: false,
  }
  memoizedReactElementsForMessages: React.ReactElement[] = []

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    trackBuildError(`INK`, {
      error: {
        stack: info.componentStack,
        text: error.message,
        context: {},
      },
    })
  }

  static getDerivedStateFromError(error: Error): IState {
    return { hasError: true, error }
  }

  render(): React.ReactElement {
    const {
      logs: { messages, activities },
      showStatusBar,
    } = this.props

    const { hasError, error } = this.state

    if (hasError && error) {
      // You can render any custom fallback UI
      return (
        <Box flexDirection="row">
          <Message
            level={ActivityLogLevels.Failed}
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
            <ErrorComponent details={msg as IErrorDetails} key={index} />
          ) : (
            <Message key={index} {...(msg as IMessageProps)} />
          )
        )
      }
    }

    const spinners: Array<IActivity> = []
    const progressBars: Array<IActivity> = []
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
