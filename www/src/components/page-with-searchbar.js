import React, { Component, Fragment } from "react"
import SearchBar from "./searchbar-body"
import { rhythm } from "../utils/typography"
import presets, { colors } from "../utils/presets"

class PageWithSearchBar extends Component {
  render() {
    const searchbarWidth = rhythm(17)

    const styles = {
      height: `calc(100vh - ${presets.headerHeight} + 1px)`,
      width: `100vw`,
      padding: rhythm(3 / 4),
      zIndex: 1,
      WebkitOverflowScrolling: `touch`,
      "::-webkit-scrollbar": {
        width: `6px`,
        height: `6px`,
      },
      "::-webkit-scrollbar-thumb": {
        background: colors.ui.bright,
      },
      "::-webkit-scrollbar-track": {
        background: colors.ui.light,
      },
    }

    const tabletStyles = {
      width: searchbarWidth,
      position: `fixed`,
      background: colors.ui.whisper,
      borderRight: `1px solid ${colors.ui.light}`,
    }

    return (
      <Fragment>
        <div
          css={{
            ...styles,
            // mobile: hide SearchBar when on gatsbyjs.org/packages/foo, aka package README page
            display: `${!this.props.isPluginsIndex && `none`}`,
            [presets.Tablet]: {
              ...tabletStyles,
              display: `block`,
            },
          }}
        >
          <SearchBar history={this.props.history} />
        </div>
        <div
          css={{
            // mobile: hide README on gatsbyjs.org/plugins index page
            display: `${this.props.isPluginsIndex && `none` }`,
            [presets.Tablet]: {
              display: `block`,
              paddingLeft: `${searchbarWidth}`,
            },
          }}
        >
          {this.props.children}
        </div>
      </Fragment>
    )
  }
}

export default PageWithSearchBar
