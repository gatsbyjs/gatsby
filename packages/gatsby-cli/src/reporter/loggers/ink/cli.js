import React from "react"
import { Box, Static } from "ink"
import { isCI } from "ci-info"

import Spinner from "../ink/components/spinner"
import ProgressBar from "../ink/components/progress-bar"

import { Message } from "../ink/components/messages"
import Error from "./components/error"
import Develop from "../ink/components/develop"

const showProgress = process.stdout.isTTY && !isCI

class CLI extends React.Component {
  render() {
    const {
      logs: { messages, activities, statefulMessages },
      showStatusBar,
    } = this.props

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
          <Static>
            {messages.map((msg, index) =>
              msg.level === `ERROR` ? (
                <Error details={msg} key={index} />
              ) : (
                <Message hideColors={true} key={index} {...msg} />
              )
            )}
          </Static>

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

          {statefulMessages.map((msg, index) =>
            // const message = statefulMessages[messageID]
            msg.level === `ERROR` ? (
              <Error details={msg} key={index} />
            ) : (
              <Message hideColors={true} key={index} {...msg} />
            )
          )}
        </Box>
        {showStatusBar && <Develop />}
      </Box>
    )
  }
}

export default CLI
