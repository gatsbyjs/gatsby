import React, { Component } from "react"

const positionStore = {}

const PositionContext = React.createContext({
  positions: positionStore,
  onPositionChange: () => {},
})

let timerId

export default class ScrollPositionProvider extends Component {
  state = { positions: positionStore }

  onPositionChange = (cacheName, position) => {
    clearTimeout(timerId)
    // wait until position has stopped changing
    timerId = setTimeout(() => {
      this.setState(() => {
        positionStore[cacheName] = position
        return { positions: { ...positionStore } }
      })
    }, 100)
  }

  render() {
    return (
      <PositionContext.Provider
        value={{
          positions: this.state.positions,
          onPositionChange: this.onPositionChange,
        }}
      >
        {this.props.children}
      </PositionContext.Provider>
    )
  }
}

export const ScrollPositionConsumer = PositionContext.Consumer
