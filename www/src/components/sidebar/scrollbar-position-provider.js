import React, { Component } from "react"

const PositionContext = React.createContext({
  position: 0,
  onPositionChange: () => {},
})

export default class ScrollPositionProvider extends Component {
  state = { scrollPosition: 0 }

  onPositionChange = position => {
    this.setState(() => {
      return { scrollPosition: position }
    })
  }

  render() {
    return (
      <PositionContext.Provider
        value={{
          position: this.state.scrollPosition,
          onPositionChange: this.onPositionChange,
        }}
      >
        {this.props.children}
      </PositionContext.Provider>
    )
  }
}

export const ScrollPositionConsumer = PositionContext.Consumer
