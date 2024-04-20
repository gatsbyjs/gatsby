import { Component, type ReactElement, type ErrorInfo } from "react"
import { Box, Static } from "ink"
import { isTTY } from "../../../util/is-tty"
import { trackBuildError } from "gatsby-telemetry"
import { Spinner } from "./components/spinner"
import { ProgressBar } from "./components/progress-bar"
import { Message, IMessageProps } from "./components/messages"
import { Error as ErrorComponent } from "./components/error"
import { ConnectedDevelop } from "./components/develop"
import { Trees } from "./components/trees"
import { IGatsbyCLIState, IActivity, ILog } from "../../redux/types"
import { ActivityLogLevels } from "../../constants"
import { IStructuredError } from "../../../structured-errors/types"

const showProgress = isTTY()

type ICLIProps = {
  logs: IGatsbyCLIState
  messages: Array<ILog>
  showStatusBar: boolean
  showTrees: boolean
}

type ICLIState = {
  hasError: boolean
  error?: Error
}

export class CLI extends Component<ICLIProps, ICLIState> {
  readonly state: ICLIState = {
    hasError: false,
  }
  memoizedReactElementsForMessages: Array<ReactElement> = []

  componentDidCatch(error: Error, info: ErrorInfo): void {
    trackBuildError(`INK`, {
      // @ts-ignore
      error: {
        error: {
          stack: info.componentStack,
        },
        text: error.message,
      },
    })
  }

  static getDerivedStateFromError(error: Error): ICLIState {
    return { hasError: true, error }
  }

  render(): JSX.Element {
    const {
      logs: { activities },
      messages,
      showStatusBar,
      showTrees,
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
          <Static items={messages}>
            {(message): ReactElement =>
              message.level === `ERROR` ? (
                <ErrorComponent
                  details={message as IStructuredError}
                  key={messages.indexOf(message)}
                />
              ) : (
                <Message
                  key={messages.indexOf(message)}
                  {...(message as IMessageProps)}
                />
              )
            }
          </Static>

          {showTrees ? <Trees /> : null}

          {spinners.map(activity => (
            <Spinner key={activity.id} {...activity} />
          ))}

          {progressBars.map(activity => (
            <ProgressBar
              key={activity.id}
              message={activity.text}
              total={activity.total || 0}
              current={activity.current || 0}
              startTime={activity.startTime || [0, 0]}
            />
          ))}
        </Box>

        {showStatusBar ? <ConnectedDevelop /> : null}
      </Box>
    )
  }
}
