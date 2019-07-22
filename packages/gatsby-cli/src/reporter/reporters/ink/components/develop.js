import React, { Component } from "react"
import { Box, Color, StdoutContext } from "ink"
import fetch from "node-fetch"

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

class Develop extends Component {
  state = {
    pagesCount: 0,
    sizes: [this.props.stdout.columns, this.props.stdout.rows],
  }
  timer = null

  fetchPageCount() {
    fetchPageQueryCount(this.props.stage.context.url).then(pagesCount =>
      this.setState({ pagesCount })
    )

    this.timer = setTimeout(this.fetchPageCount.bind(this), 1000)
  }

  componentDidMount() {
    this.fetchPageCount()

    const { stdout } = this.props
    stdout.on(`resize`, () => {
      this.setState({
        sizes: [stdout.columns, stdout.rows],
      })
    })
  }

  componentWillUpdate(nextProps) {
    if (this.props.stdout !== nextProps.stdout) {
      this.props.stdout.off(`resize`)

      const { stdout } = nextProps
      stdout.on(`resize`, () => {
        this.setState({
          sizes: [stdout.columns, stdout.rows],
        })
      })
    }
  }

  componentWillUnmount() {
    this.props.stdout.off(`resize`)

    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  render() {
    return (
      <Box flexDirection="column" marginTop={2}>
        <Box textWrap={`truncate`}>{`—`.repeat(this.state.sizes[0])}</Box>
        <Box height={1} flexDirection="row">
          <Color>{this.state.pagesCount} pages</Color>
          <Box flexGrow={1} />
          <Color>{this.props.stage.context.appName}</Color>
        </Box>
      </Box>
    )
  }
}

export default props => (
  <StdoutContext.Consumer>
    {({ stdout }) => <Develop stdout={stdout} {...props} />}
  </StdoutContext.Consumer>
)
