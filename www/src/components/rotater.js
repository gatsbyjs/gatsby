import React, { Component } from "react"
import Slider from "./Slider"
import { options } from "../utils/typography"
import { scale, colors, space, radii } from "../utils/presets"
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
  fontSize: scale[5],
  width: space[8],
  textAlign: `center`,
  "&:hover": { cursor: `pointer`, color: colors.gatsby },
}

class Rotater extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = { item: 0, size: {} }
  }

  decrementItem() {
    clearInterval(this.state.intervalId)
    this.setState({
      intervalId: -1,
      item:
        (this.state.item + this.props.items.length - 1) %
        this.props.items.length,
    })
  }

  incrementItemAndClearInterval() {
    clearInterval(this.state.intervalId)
    this.incrementItem()
    this.setState({
      intervalId: -1,
    })
  }

  incrementItem() {
    this.setState({
      item: (this.state.item + 1) % this.props.items.length,
    })
  }

  componentDidMount() {
    const intervalId = setInterval(() => this.incrementItem(), 5000)
    this.setState({ intervalId, size: this.getDimensions() })
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.item !== this.state.item) {
      this.setState({ size: this.getDimensions() })
    }
  }

  getDimensions() {
    if (this.wordBox == null) {
      return {
        width: `auto`,
        height: `auto`,
      }
    }

    return this.wordBox.getBoundingClientRect()
  }

  render() {
    const { text, pluginName } = this.props.items[this.state.item]

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
        <p
          css={{
            color: colors.gray.copy,
            marginLeft: space[9],
            marginRight: space[9],
            fontSize: scale[4],
            fontFamily: options.headerFontFamily.join(`,`),
            textAlign: `center`,
            marginBottom: 0,
          }}
        >
          <span>Need&nbsp;</span>
          <span
            style={{
              display: `inline-block`,
              transition: `width 150ms linear`,
              width: this.state.size.width || `auto`,
            }}
          >
            <span
              css={{
                fontWeight: 600,
                whiteSpace: `nowrap`,
                display: `inline-block`,
              }}
              ref={n => {
                this.wordBox = n
              }}
            >
              {this.state.intervalId == -1 ? (
                <>{text}</>
              ) : (
                <Slider
                  items={[text]}
                  color={`#000`}
                  getSize={size => this.setState({ size })}
                />
              )}
            </span>
          </span>
        </p>

        <p
          css={{
            color: colors.gray.calm,
            margin: 0,
            fontSize: scale[3],
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
        <button
          css={{ ...controlButtonStyles }}
          onClick={this.decrementItem.bind(this)}
        >
          <MdNavigateBefore aria-hidden="true" />
          <span css={srOnly}>Previous</span>
        </button>
        <button
          css={{ ...controlButtonStyles, left: `auto`, right: 0 }}
          onClick={this.incrementItemAndClearInterval.bind(this)}
        >
          <MdNavigateNext aria-hidden="true" />
          <span css={srOnly}>Next</span>
        </button>
      </div>
    )
  }
}

export default Rotater
