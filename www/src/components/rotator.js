/** @jsx jsx */
import { jsx } from "theme-ui"

import React, { Component } from "react"
import Slider from "./slider"
import Link from "./localized-link"
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md"
import { visuallyHidden } from "../utils/styles"

const controlButtonStyles = {
  WebkitAppearance: `none`,
  color: `textMuted`,
  fontWeight: `bold`,
  border: 0,
  background: `transparent`,
  position: `absolute`,
  top: 0,
  bottom: 0,
  left: 0,
  padding: 0,
  fontSize: 5,
  width: t => t.space[8],
  textAlign: `center`,
  "&:hover": {
    cursor: `pointer`,
    color: `gatsby`,
    bg: `ui.hover`,
  },
  "&:active": { bg: `ui.hover` },
}

class Rotator extends Component {
  state = {
    shouldAnimate: false,
    item: 0,
    size: {},
  }
  sliderContainer = React.createRef()
  intervalId = null

  _clearInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  decrementItem = () => {
    this._clearInterval()
    this.setState({
      item:
        (this.state.item + this.props.items.length - 1) %
        this.props.items.length,
    })
  }

  incrementItemAndClearInterval = () => {
    this._clearInterval()
    this.incrementItem()
  }

  incrementItem = () => {
    this.setState(state => {
      return {
        item: (state.item + 1) % this.props.items.length,
      }
    })
  }

  componentDidMount() {
    const shouldAnimate = this.shouldAnimate()
    if (shouldAnimate) {
      requestAnimationFrame(() => {
        this.intervalId = setInterval(this.incrementItem, 5000)
        this.setState({ shouldAnimate, size: this.getDimensions() })
      })
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalId)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.shouldAnimate && prevState.item !== this.state.item) {
      requestAnimationFrame(() => {
        this.setState({ size: this.getDimensions() })
      })
    }
  }

  getDimensions() {
    if (this.sliderContainer.current === null) {
      return {
        width: `auto`,
        height: `auto`,
      }
    }

    return this.sliderContainer.current.getBoundingClientRect()
  }

  shouldAnimate() {
    const mediaQuery = window.matchMedia(`(prefers-reduced-motion)`)
    return !mediaQuery || !mediaQuery.matches
  }

  render() {
    const { shouldAnimate } = this.state
    const { text, pluginName } = this.props.items[this.state.item]
    const enableSlider = shouldAnimate && this.intervalId

    return (
      <div
        sx={{
          borderTop: 1,
          borderBottom: 1,
          borderColor: `ui.border`,
          py: 4,
          px: 9,
          my: 6,
          position: `relative`,
        }}
      >
        <div
          aria-live={this.intervalId ? `off` : `polite`}
          aria-atomic="true"
          aria-relevant="all"
        >
          <p
            sx={{
              fontSize: 4,
              fontFamily: `heading`,
              textAlign: `center`,
              mb: 0,
            }}
          >
            <span>Need&nbsp;</span>
            <span
              style={{
                display: `inline-block`,
                transition: shouldAnimate ? `width 150ms linear` : `none`,
                width: this.state.size.width || `auto`,
              }}
            >
              <span
                sx={{
                  fontWeight: `bold`,
                  whiteSpace: `nowrap`,
                  display: `inline-block`,
                }}
                id="headline-slider"
                ref={this.sliderContainer}
              >
                {!enableSlider ? (
                  <>{text}</>
                ) : (
                  <Slider items={[text]} color="inherit" />
                )}
              </span>
            </span>
          </p>

          <p
            sx={{
              color: `textMuted`,
              margin: 0,
              fontSize: 3,
              textAlign: `center`,
            }}
          >
            There’s{` `}
            {pluginName ? (
              <Link to={`/packages/` + pluginName}>a plugin</Link>
            ) : (
              `a plugin`
            )}
            {` `}
            for that.
          </p>
        </div>
        <button
          sx={controlButtonStyles}
          onClick={this.decrementItem}
          aria-controls="headline-slider"
        >
          <MdNavigateBefore aria-hidden="true" />
          <span css={visuallyHidden}>Previous plugin category</span>
        </button>
        <button
          sx={{ ...controlButtonStyles, left: `auto`, right: 0 }}
          onClick={this.incrementItemAndClearInterval}
          aria-controls="headline-slider"
        >
          <MdNavigateNext aria-hidden="true" />
          <span css={visuallyHidden}>Next plugin category</span>
        </button>
      </div>
    )
  }
}

export default Rotator
