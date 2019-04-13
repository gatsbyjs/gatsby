import React, { Component } from "react"
import Slider from "./slider"
import { options } from "../utils/typography"
import { fontSizes, colors, space, radii } from "../utils/presets"
import Link from "gatsby-link"
import MdNavigateBefore from "react-icons/lib/md/navigate-before"
import MdNavigateNext from "react-icons/lib/md/navigate-next"
import { srOnly } from "../utils/styles"

const controlButtonStyles = {
  WebkitAppearance: `none`,
  color: colors.gray.calm,
  fontWeight: 700,
  border: 0,
  background: `transparent`,
  position: `absolute`,
  top: 0,
  bottom: 0,
  left: 0,
  padding: 0,
  fontSize: fontSizes[5],
  width: space[8],
  textAlign: `center`,
  "&:hover": {
    cursor: `pointer`,
    color: colors.gatsby,
    background: colors.ui.whisper,
  },
  "&:active": { background: colors.ui.light },
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
        css={{
          borderTop: `1px solid ${colors.gray.border}`,
          borderBottom: `1px solid ${colors.gray.border}`,
          borderRadius: radii[2],
          padding: `${space[4]} ${space[9]}`,
          margin: `${space[6]} 0`,
          position: `relative`,
        }}
      >
        <div
          aria-live={this.intervalId ? `off` : `polite`}
          aria-atomic="true"
          aria-relevant="all"
        >
          <p
            css={{
              color: colors.gray.copy,
              fontSize: fontSizes[4],
              fontFamily: options.headerFontFamily.join(`,`),
              textAlign: `center`,
              marginBottom: 0,
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
                css={{
                  fontWeight: 600,
                  whiteSpace: `nowrap`,
                  display: `inline-block`,
                }}
                id="headline-slider"
                ref={this.sliderContainer}
              >
                {!enableSlider ? (
                  <>{text}</>
                ) : (
                  <Slider items={[text]} color={`#000`} />
                )}
              </span>
            </span>
          </p>

          <p
            css={{
              color: colors.gray.calm,
              margin: 0,
              fontSize: fontSizes[3],
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
          css={{ ...controlButtonStyles }}
          onClick={this.decrementItem}
          aria-controls="headline-slider"
        >
          <MdNavigateBefore aria-hidden="true" />
          <span css={srOnly}>Previous plugin category</span>
        </button>
        <button
          css={{ ...controlButtonStyles, left: `auto`, right: 0 }}
          onClick={this.incrementItemAndClearInterval}
          aria-controls="headline-slider"
        >
          <MdNavigateNext aria-hidden="true" />
          <span css={srOnly}>Next plugin category</span>
        </button>
      </div>
    )
  }
}

export default Rotator
