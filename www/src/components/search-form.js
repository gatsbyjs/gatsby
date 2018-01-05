import React, { Component } from "react"
import PropTypes from "prop-types"
import { rhythm } from "../utils/typography"
import presets from "../utils/presets"

class SearchForm extends Component {
  constructor() {
    super()
    this.state = { enabled: true }
  }

  componentDidMount() {
    if (
      typeof window === `undefined` || // eslint-disable-line no-undef
      typeof window.docsearch === `undefined` // eslint-disable-line no-undef
    ) {
      console.warn(`Search has failed to load and now is being disabled`)
      this.setState({ enabled: false })
      return
    }

    // eslint-disable-next-line no-undef
    window.docsearch({
      apiKey: `71af1f9c4bd947f0252e17051df13f9c`,
      indexName: `gatsbyjs`,
      inputSelector: `#doc-search`,
      debug: true,
    })
  }

  render() {
    const { enabled } = this.state
    const { styles } = this.props.styles
    return enabled ? (
      <form
        css={{
          ...styles,
          display: `flex`,
          flex: `0 0 auto`,
          flexDirection: `row`,
          alignItems: `center`,
          marginLeft: rhythm(1 / 2),
          marginBottom: 0,
        }}
      >
        <input
          id="doc-search"
          css={{
            appearance: `none`,
            background: `transparent`,
            border: 0,
            color: presets.brand,
            paddingTop: rhythm(1 / 8),
            paddingRight: rhythm(1 / 4),
            paddingBottom: rhythm(1 / 8),
            paddingLeft: rhythm(1),
            backgroundImage: `url(/search.svg)`,
            backgroundSize: `16px 16px`,
            backgroundRepeat: `no-repeat`,
            backgroundPositionY: `center`,
            backgroundPositionX: `5px`,
            overflow: `hidden`,
            width: rhythm(1),
            transition: `width 0.2s ease`,

            ":focus": {
              outline: 0,
              backgroundColor: presets.brandLighter,
              borderRadius: presets.radiusLg,
              width: rhythm(5),
            },

            [presets.Desktop]: {
              width: rhythm(5),
            },
          }}
          type="search"
          placeholder="Search docs"
          aria-label="Search docs"
        />
      </form>
    ) : null
  }
}

SearchForm.propTypes = {
  styles: PropTypes.object,
}

export default SearchForm
