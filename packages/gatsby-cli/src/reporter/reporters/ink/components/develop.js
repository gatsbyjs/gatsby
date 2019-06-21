import React, { useContext, useState, useEffect, useRef } from "react"
import { Box, Color, StdoutContext } from "ink"
import fetch from "node-fetch"

// Handy hook from https://overreacted.io/making-setinterval-declarative-with-react-hooks/
function useInterval(callback, delay) {
  const savedCallback = useRef()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }

    return null
  }, [delay])
}

// Track the width and height of the terminal. Responsive app design baby!
const useTerminalResize = () => {
  const { stdout } = useContext(StdoutContext)
  const [sizes, setSizes] = useState([stdout.columns, stdout.rows])
  useEffect(() => {
    stdout.on(`resize`, () => {
      setSizes([stdout.columns, stdout.rows])
    })
    return () => {
      stdout.off(`resize`)
    }
  }, [stdout])

  return sizes
}

// Query the site's graphql instance for the latest count.
const fetchPageQueryCount = url =>
  fetch(`${url}___graphql`, {
    method: `post`,
    body: JSON.stringify({
      query: `query MyQuery {
  allSitePage {
    totalCount
  }
}`,
    }),
    headers: { "Content-Type": `application/json` },
  })
    .then(res => res.json())
    .then(json => json.data.allSitePage.totalCount)

const Develop = props => {
  const [pagesCount, setPagesCount] = useState(0)

  fetchPageQueryCount(props.stage.context.url).then(count =>
    setPagesCount(count)
  )
  // Query for latest page count every second.
  // Built-in subscriptions would be nice.
  useInterval(() => {
    // POST to get pages count.
    fetchPageQueryCount(props.stage.context.url).then(count =>
      setPagesCount(count)
    )
  }, 1000)

  const [width] = useTerminalResize()

  return (
    <Box flexDirection="column" marginTop={2}>
      <Box textWrap={`truncate`}>{`—`.repeat(width)}</Box>
      <Box height={1} flexDirection="row">
        <Color>{pagesCount} pages</Color>
        <Box flexGrow={1} />
        <Color>{props.stage.context.appName}</Color>
      </Box>
    </Box>
  )
}

export default Develop
