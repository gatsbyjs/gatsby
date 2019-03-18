const React = require(`react`)
const { render, Static, Box, Color } = require(`ink`)

const Success = ({ children }) => (
  <Box>
    <Color green>success</Color> {children}
  </Box>
)
const Verbose = ({ children }) => (
  <Box>
    <Color gray>verbose</Color> {children}
  </Box>
)
const Info = ({ children }) => (
  <Box>
    <Color blue>info</Color> {children}
  </Box>
)

const getMessageComponent = type => {
  switch (type) {
    case `success`:
      return Success
    case `verbose`:
      return Verbose
    case `info`:
    default:
      return Info
  }
}

class Activity extends React.Component {
  state = {
    status: ``,
    elapsedTime: 0,
  }

  render() {
    return (
      <>
        {name} - {this.state.elapsedTime} - {status}
      </>
    )
  }
}

class GatsbyReporter extends React.Component {
  state = {
    verbose: false,
    messages: [],
    activities: {},
  }

  startActivity = (name, str) => {}

  setActivityStatus = (name, str) => {}

  endActivity = (name, str) => {}

  setVerbose(isVerbose = true) {
    this.setState({ verbose: isVerbose })
  }

  _addMessage(type, str) {
    this.setState(state => {
      return {
        messages: [
          ...state.messages,
          {
            text: str,
            type,
          },
        ],
      }
    })
  }

  onInfo = this._addMessage.bind(this, `info`)
  onSuccess = this._addMessage.bind(this, `success`)
  onVerbose = str => {
    if (!this.state.verbose) {
      return
    }

    this._addMessage(`verbose`, str)
  }

  componentDidMount() {
    if (this.props.init) {
      this.props.init({
        onSuccess: this.onSuccess,
        startActivity: this.startActivity,
        setActivityStatus: this.setActivityStatus,
        endActivity: this.endActivity,
      })
    }
  }

  render() {
    return (
      <Box flexDirection="column">
        <Box flexDirection="column" marginTop={1}>
          {this.state.messages.map(msg => {
            const Component = getMessageComponent(msg.type)

            return <Component key={msg.text}>{msg.text}</Component>
          })}
        </Box>
      </Box>
    )
  }
}

// render the react component and expose it so it can be changed from the outside world
const inkReporter = React.createRef()
render(<GatsbyReporter ref={inkReporter} />)

module.exports = inkReporter.current
