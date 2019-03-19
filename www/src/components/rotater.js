import React, { Component } from "react"
import Slider from "./Slider"
import { rhythm, options } from "../utils/typography"
import presets, { colors, space } from "../utils/presets"
import Link from "gatsby-link"
import MdNavigateBefore from "react-icons/lib/md/navigate-before"
import MdNavigateNext from "react-icons/lib/md/navigate-next"
import { srOnly } from "../utils/styles"

const controlButtonStyles = {
  WebkitAppearance: `none`,
  fontWeight: 700,
  border: 0,
  background: `transparent`,
  "&:hover": { cursor: `pointer` },
}

class Search extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = { item: 0 }
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
    this.setState({ intervalId })
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId)
  }
  render() {
    const { text, pluginName } = this.props.items[this.state.item]
    return (
      <>
        <p
          css={{
            color: colors.gray.calm,
            marginLeft: rhythm(space[9]),
            marginRight: rhythm(space[9]),
            fontSize: presets.scale[5],
            fontFamily: options.headerFontFamily.join(`,`),
            textAlign: `center`,
          }}
        >
          <span
            css={{
              [presets.Tablet]: {
                marginRight: rhythm(1 / 8),
              },
            }}
          >
            Need&nbsp;
          </span>
          <span
            css={{
              fontWeight: 600,
            }}
          >
            {this.state.intervalId == -1 ? (
              <span css={{}}>{text}</span>
            ) : (
              <span>
                <Slider items={[text]} color={colors.gray.calm} />
              </span>
            )}
          </span>
          <br />
          <button
            css={controlButtonStyles}
            onClick={this.decrementItem.bind(this)}
          >
            <MdNavigateBefore aria-hidden="true" />
            <span css={srOnly}>Previous</span>
          </button>
          &nbsp;&nbsp;&nbsp;There’s{` `}
          {pluginName ? (
            <Link to={`/packages/` + pluginName}>a plugin</Link>
          ) : (
            `a plugin`
          )}
          {` `}
          for that.
          <span>
            &nbsp;&nbsp;&nbsp;
            <button
              css={controlButtonStyles}
              onClick={this.incrementItemAndClearInterval.bind(this)}
            >
              <MdNavigateNext aria-hidden="true" />
              <span css={srOnly}>Next</span>
            </button>
          </span>
        </p>
      </>
    )
  }
}

export default Search
