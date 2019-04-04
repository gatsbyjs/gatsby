import React, { Component } from "react"
import PropTypes from "prop-types"
import { Box } from "ink"
import isCi from "is-ci"
import spinners from "cli-spinners"

const enableAnimation = !!process.stdout.isTTY && !isCi

export default class Spinner extends Component {
  static propTypes = {
    type: PropTypes.string,
  }

  static defaultProps = {
    type: `dots`,
  }

  state = {
    frame: 0,
  }

  render() {
    const spinner = this.getSpinner()

    return <Box>{spinner.frames[this.state.frame]}</Box>
  }

  componentDidMount() {
    if (!enableAnimation) {
      return
    }

    const spinner = this.getSpinner()
    this.timer = setInterval(this.switchFrame, spinner.interval)
  }

  componentWillUnmount() {
    if (!this.timer) {
      return
    }

    clearInterval(this.timer)
  }

  getSpinner() {
    return spinners[this.props.type] || spinners.dots
  }

  switchFrame = () => {
    const { frame } = this.state
    const spinner = this.getSpinner()
    const isLastFrame = frame === spinner.frames.length - 1
    const nextFrame = isLastFrame ? 0 : frame + 1

    this.setState({
      frame: nextFrame,
    })
  }
}
