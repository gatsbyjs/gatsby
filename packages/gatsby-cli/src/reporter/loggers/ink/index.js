import React, { useState, useEffect } from "react"
import { render, Box, Static } from "ink"
import { Provider, connect } from "react-redux"
import { isCI } from "ci-info"

import Spinner from "../ink/components/spinner"
import ProgressBar from "../ink/components/progress-bar"

import { Message } from "../ink/components/messages"
import Error from "./components/error"
import Develop from "../ink/components/develop"

import { getStore, onStoreSwap } from "../../redux/index"

const showProgress = process.stdout.isTTY && !isCI

class SimpleOutput extends React.Component {
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
                {msg.level === `ERROR` ? (
                  <Error details={msg} />
                ) : (
                  <Message level={msg.level} hideColors={true}>
                    {msg.text}
                  </Message>
                )}
              </Box>
            ))}
          </Static>

          {spinners.map(activity => (
            <Spinner key={activity.name} {...activity} />
          ))}

          {progressBars.map(activity => (
            <ProgressBar
              key={activity.name}
              message={activity.name}
              total={activity.total}
              current={activity.current}
              startTime={activity.startTime}
            />
          ))}

          {Object.keys(statefulMessages).map(messageID => {
            const message = statefulMessages[messageID]
            return (
              <Message type={message.type} key={messageID}>
                {message.text}
              </Message>
            )
          })}
        </Box>
        {showStatusBar && <Develop />}
      </Box>
    )
  }
}

const ConnectedSimpleOutput = connect(state => {
  const showStatusBar =
    state.program &&
    state.program._ &&
    state.program._[0] === `develop` &&
    state.program.status === `BOOTSTRAP_FINISHED`
  return {
    logs: state.logs,
    // pageCount: state.pages ? state.pages.size : 0,
    showStatusBar,
    // command: state.program ? state.program._ : ``,
    // bootstrapFinished: state.program ? state.program.status : ``,
  }
})(SimpleOutput)

const ReduxStoreProvider = ({ children }) => {
  const [store, setStore] = useState(getStore())
  useEffect(() => {
    onStoreSwap(newStore => {
      setStore(newStore)
    })
  }, [])

  return <Provider store={store}>{children}</Provider>
}

render(
  <ReduxStoreProvider>
    <ConnectedSimpleOutput />
  </ReduxStoreProvider>
)
