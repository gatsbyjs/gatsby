import React, { Component } from "react"
import PropTypes from "prop-types"
import { navigateTo } from "gatsby"
import { rhythm } from "../utils/typography"

import presets, { colors } from "../utils/presets"
import hex2rgba from "hex2rgba"
import SearchIcon from "./search-icon"

import { css } from "glamor"

const { curveDefault, speedDefault } = presets.animation

// Override default search result styles (docsearch.css)
css.insert(`
  .algolia-autocomplete .ds-dropdown-menu {
    position: fixed !important;
    top: ${rhythm(2)} !important;
    left: ${rhythm(0.5)} !important;
    right: ${rhythm(0.5)} !important;
    min-width: calc(100vw - ${rhythm(1)}) !important;
    max-width: calc(100vw - 2rem) !important;
    max-height: calc(100vh - 5rem) !important;
    box-shadow: 0 3px 10px 0.05rem ${hex2rgba(colors.lilac, 0.25)} !important;
  }

  .is-homepage .algolia-autocomplete .ds-dropdown-menu {
    top: ${rhythm(2.5)} !important;
  }

  /* .searchWrap to beat docsearch.css' !important */
  .searchWrap .algolia-autocomplete.algolia-autocomplete-right .ds-dropdown-menu,
  .searchWrap .algolia-autocomplete.algolia-autocomplete-left .ds-dropdown-menu {
    left: ${rhythm(0.5)} !important;
    right: ${rhythm(0.5)} !important;
  }

  .algolia-autocomplete .ds-dropdown-menu .ds-suggestions {
    margin-top: 0 !important;
  }

  .algolia-docsearch-suggestion--wrapper {
    padding-top: 0 !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion--subcategory-column {
    color: ${colors.gray.calm} !important;
    font-size: 0.9rem !important;
    font-weight: normal !important;
    padding: ${rhythm(0.25)} ${rhythm(0.5)} !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion--subcategory-column:before {
    background: ${colors.ui.light} !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion--subcategory-column:after {
    display: none !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion {
    padding: 0 !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion--content {
    padding: ${rhythm(0.5)} !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Caret */
  .algolia-autocomplete .ds-dropdown-menu::before {
    border-top-color: ${colors.ui.bright} !important;
    border-right-color: ${colors.ui.bright} !important;
  }

  .algolia-autocomplete .ds-dropdown-menu [class^="ds-dataset-"] {
    padding: 0 !important;
    border-color: ${colors.ui.bright} !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion--highlight {
    background-color: ${colors.ui.bright} !important;
    box-shadow: 0 !important;
    color: ${colors.gatsby} !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion--text {
    color: ${colors.gray.calm} !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion--text .algolia-docsearch-suggestion--highlight {
    background: transparent !important;
    box-shadow: inset 0 -2px 0 0 ${colors.gatsby} !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--subcategory-column {
    width: 100% !important;
  }

  .algolia-autocomplete .ds-dropdown-menu .ds-suggestion.ds-cursor .algolia-docsearch-suggestion:not(.suggestion-layout-simple) .algolia-docsearch-suggestion--content {
    background-color: ${colors.ui.light} !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--content.algolia-docsearch-suggestion--no-results {
    max-width: 100% !important;
    width: 100% !important;
    font-weight: normal !important;
    padding: ${rhythm(0.75)} ${rhythm(0.5)} !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--content.algolia-docsearch-suggestion--no-results .algolia-docsearch-suggestion--title {
    margin-bottom: 0 !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--content.algolia-docsearch-suggestion--no-results .algolia-docsearch-suggestion--text {
    color: inherit !important;
    font-weight: normal !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--content.algolia-docsearch-suggestion--no-results .algolia-docsearch-suggestion--text:after {
    content: "😔";
  }

  .algolia-autocomplete .algolia-docsearch-suggestion--category-header {
    padding: ${rhythm(0.25)} ${rhythm(0.5)} !important;
    margin-top: 0 !important;
    font-size: 0.9rem !important;
    border-color: ${colors.ui.light} !important;
    color: ${colors.gatsby} !important;
    font-weight: bold !important;
  }

  .searchWrap .algolia-autocomplete.algolia-autocomplete-right .ds-dropdown-menu::before {
    right: ${rhythm(4.75)} !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--content.algolia-docsearch-suggestion--no-results:before {
    display: none !important;
  }

  .algolia-autocomplete .algolia-docsearch-footer {
    width: 100% !important;
    height: 30px !important;
    margin-top: 0 !important;
    border-top: 1px dotted ${colors.ui.light} !important;
  }

  .algolia-autocomplete .algolia-docsearch-footer--logo {
    width: 110px !important;
    height: 100% !important;
    margin-left: auto !important;
    margin-right: ${rhythm(0.5)} !important;
  }

  @media ${presets.phablet} {
    .algolia-autocomplete .algolia-docsearch-suggestion--category-header {
      color: inherit !important;
      font-weight: normal !important;
    }

    .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--subcategory-column {
      width: 30% !important;
      text-align: right !important;
      opacity: 1 !important;
      padding: ${rhythm(0.5)} ${rhythm(0.75)} !important;
    }

    .algolia-autocomplete .algolia-docsearch-suggestion--category-header {
      padding: ${rhythm(0.5)} ${rhythm(0.75)} !important;
    }

    .algolia-autocomplete .algolia-docsearch-suggestion--content {
      width: 70% !important;
      max-width: 70% !important;
      padding: ${rhythm(0.5)} ${rhythm(0.75)} !important;
    }

    .algolia-autocomplete .algolia-docsearch-suggestion--content:before,
    .algolia-autocomplete .algolia-docsearch-suggestion--subcategory-column:after {
      display: block !important;
      content: "" !important;
      position: absolute !important;
      top: 0 !important;
      height: 100% !important;
      width: 1px !important;
      background: ${colors.ui.light} !important;
    }

    .algolia-autocomplete .algolia-docsearch-suggestion--subcategory-column:after {
      right: 0 !important;
    }

    .algolia-autocomplete .algolia-docsearch-suggestion--content:before {
      left: -1px !important;
    }
  }

  @media ${presets.tablet} {
    .is-homepage .algolia-autocomplete .ds-dropdown-menu,
    .algolia-autocomplete .ds-dropdown-menu {
      top: 100% !important;
      position: absolute !important;
      max-width: 600px !important;
      min-width: 500px !important;
    }

    /* .searchWrap to beat docsearch.css' !important */
    .searchWrap .algolia-autocomplete.algolia-autocomplete-right .ds-dropdown-menu {
      right: 0 !important;
      left: inherit !important;
    }

    .searchWrap .algolia-autocomplete.algolia-autocomplete-right .ds-dropdown-menu::before {
      right: ${rhythm(3)} !important;
    }
  }

  @media ${presets.desktop} {
    .algolia-autocomplete .ds-dropdown-menu {
      max-width: 600px !important;
      min-width: 540px !important;
    }

    .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--subcategory-column {
      width: 35% !important;
    }

    .algolia-autocomplete .algolia-docsearch-suggestion--content {
      width: 65% !important;
      max-width: 65% !important;
    }
  }
`)

class SearchForm extends Component {
  constructor() {
    super()
    this.state = { enabled: true, focussed: false }
    this.autocompleteSelected = this.autocompleteSelected.bind(this)
    this.focusSearchInput = this.focusSearchInput.bind(this)
  }

  /**
   * Replace the default selection event, allowing us to do client-side
   * navigation thus avoiding a full page refresh.
   *
   * Ref: https://github.com/algolia/autocomplete.js#events
   */
  autocompleteSelected(e) {
    e.stopPropagation()
    // Use an anchor tag to parse the absolute url (from autocomplete.js) into a relative url
    // eslint-disable-next-line no-undef
    const a = document.createElement(`a`)
    a.href = e._args[0].url
    this.searchInput.blur()
    navigateTo(`${a.pathname}${a.hash}`)
  }

  focusSearchInput(e) {
    if (e.key !== `s`) return

    // ignore this shortcut whenever an <input> has focus
    if (document.activeElement instanceof window.HTMLInputElement) return // eslint-disable-line no-undef

    e.preventDefault()
    this.searchInput.focus()
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
    window.addEventListener(`keydown`, this.focusSearchInput)

    // eslint-disable-next-line no-undef
    window.addEventListener(
      `autocomplete:selected`,
      this.autocompleteSelected,
      true
    )

    // eslint-disable-next-line no-undef
    window.docsearch({
      apiKey: `71af1f9c4bd947f0252e17051df13f9c`,
      indexName: `gatsbyjs`,
      inputSelector: `#doc-search`,
      debug: false,
    })
  }

  componentWillUnmount() {
    // eslint-disable-next-line no-undef
    window.removeEventListener(`keydown`, this.focusSearchInput)
  }

  render() {
    const { enabled, focussed } = this.state
    const { iconStyles, isHomepage } = this.props

    return enabled ? (
      <form
        css={{
          display: `flex`,
          flex: `0 0 auto`,
          flexDirection: `row`,
          alignItems: `center`,
          marginLeft: rhythm(1 / 2),
          marginBottom: 0,
        }}
        className="searchWrap"
        onSubmit={e => e.preventDefault()}
      >
        <label css={{ position: `relative` }}>
          <input
            id="doc-search"
            css={{
              appearance: `none`,
              backgroundColor: `transparent`,
              border: 0,
              borderRadius: presets.radiusLg,
              color: colors.gatsby,
              paddingTop: rhythm(1 / 8),
              paddingRight: rhythm(1 / 4),
              paddingBottom: rhythm(1 / 8),
              paddingLeft: rhythm(1),
              overflow: `hidden`,
              width: rhythm(1),
              transition: `width ${speedDefault} ${curveDefault}, background-color ${speedDefault} ${curveDefault}`,
              ":focus": {
                outline: 0,
                backgroundColor: colors.ui.light,
                borderRadius: presets.radiusLg,
                width: rhythm(5),
                transition: `width ${speedDefault} ${curveDefault}, background-color ${speedDefault} ${curveDefault}`,
              },

              [presets.Desktop]: {
                backgroundColor: !isHomepage && `#fff`,
                color: colors.gatsby,
                width: !isHomepage && rhythm(5),
                ":focus": {
                  backgroundColor: colors.ui.light,
                  color: colors.gatsby,
                },
              },

              [presets.Hd]: {
                backgroundColor: isHomepage && colors.lilac,
                color: isHomepage && colors.ui.light,
                width: isHomepage && rhythm(5),
              },
            }}
            type="search"
            placeholder="Search docs"
            aria-label="Search docs"
            title="Hit 's' to search docs"
            onFocus={() => this.setState({ focussed: true })}
            onBlur={() => this.setState({ focussed: false })}
            ref={input => {
              this.searchInput = input
            }}
          />
          <SearchIcon
            overrideCSS={{
              ...iconStyles,
              fill: focussed && colors.gatsby,
              position: `absolute`,
              left: `5px`,
              top: `50%`,
              width: `16px`,
              height: `16px`,
              pointerEvents: `none`,
              transition: `fill ${speedDefault} ${curveDefault}`,
              transform: `translateY(-50%)`,

              [presets.Hd]: {
                fill: focussed && isHomepage && colors.gatsby,
              },
            }}
          />
        </label>
      </form>
    ) : null
  }
}

SearchForm.propTypes = {
  isHomepage: PropTypes.bool,
  iconStyles: PropTypes.object,
}

export default SearchForm
