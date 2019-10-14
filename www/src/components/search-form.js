/** @jsx jsx */
import { jsx } from "theme-ui"
import { Component } from "react"
import { navigate } from "gatsby"

import { space } from "../gatsby-plugin-theme-ui"
import SearchIcon from "./search-icon"
import { themedInput } from "../utils/styles"

const loadJS = () => import(`./docsearch.min.js`)
let loadedJs = false

import { Global, css } from "@emotion/core"

// Override default search result styles (docsearch.css)
const searchDropdownOffsetTop = space[9]

const algoliaStyles = t => css`
  .algolia-autocomplete .algolia-docsearch-suggestion--title {
    color: ${t.colors.text} !important;
  }

  .algolia-autocomplete .ds-dropdown-menu [class^=ds-dataset-] {
    border-color: ${t.colors.ui.border} !important;
    background: ${t.colors.background} !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion {
    background: ${t.colors.background} !important; 
  }

  .algolia-autocomplete .ds-dropdown-menu {
    font-family: ${t.fonts.system};
    position: fixed !important;
    top: calc(${searchDropdownOffsetTop} + ${t.sizes.bannerHeight}) !important;
    left: ${t.space[3]} !important;
    right: ${t.space[3]} !important;
    min-width: calc(100vw - ${t.space[5]}) !important;
    max-width: calc(100vw - ${t.space[7]})) !important;
    box-shadow: ${t.shadows.dialog} !important;
  }

  .algolia-autocomplete .ds-dropdown-menu:before {
    background: ${t.colors.background} !important; 
  }

  /* .searchWrap to beat docsearch.css' !important */
  .searchWrap
    .algolia-autocomplete.algolia-autocomplete-right
    .ds-dropdown-menu,
  .searchWrap
    .algolia-autocomplete.algolia-autocomplete-left
    .ds-dropdown-menu {
    left: ${t.space[3]} !important;
    right: ${t.space[3]} !important;
  }

  .algolia-autocomplete .ds-dropdown-menu .ds-suggestions {
    margin-top: 0 !important;
  }

  .algolia-docsearch-suggestion--wrapper {
    padding-top: 0 !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion--subcategory-column {
    color: ${t.colors.textMuted} !important;
    font-size: ${t.fontSizes[1]} !important;
    font-weight: normal !important;
    padding: ${t.space[1]} ${t.space[3]} !important;
  }

  .algolia-autocomplete
    .algolia-docsearch-suggestion--subcategory-column:before {
    background: ${t.colors.ui.border} !important;
  }

  .algolia-autocomplete
    .algolia-docsearch-suggestion--subcategory-column:after {
    display: none !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion {
    padding: 0 !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion--content {
    padding: ${t.space[3]} !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Caret */
  .algolia-autocomplete .ds-dropdown-menu::before {
    border-top-color: ${t.colors.ui.border} !important;
    border-right-color: ${t.colors.ui.border} !important;
  }

  .algolia-autocomplete .ds-dropdown-menu [class^="ds-dataset-"] {
    max-height: calc(
      100vh - ${t.sizes.headerHeight} - ${t.sizes.bannerHeight}
    ) !important;
    padding: 0 !important;
    border-color: ${t.colors.ui.border} !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion--highlight {
    background-color: ${
      t.colors.search.suggestionHighlightBackground
    } !important;
    box-shadow: 0 !important;
    color: ${t.colors.search.suggestionHighlightColor} !important;
  }

  .algolia-autocomplete .algolia-docsearch-suggestion--text {
    color: ${t.colors.textMuted} !important;
  }

  .algolia-autocomplete
    .algolia-docsearch-suggestion--text
    .algolia-docsearch-suggestion--highlight {
    background: transparent !important;
    box-shadow: inset 0 -1px 0 0 ${t.colors.gatsby} !important;
  }

  .algolia-autocomplete
    .algolia-docsearch-suggestion
    .algolia-docsearch-suggestion--subcategory-column {
    width: 100% !important;
  }

  .algolia-autocomplete
    .ds-dropdown-menu
    .ds-suggestion.ds-cursor
    .algolia-docsearch-suggestion:not(.suggestion-layout-simple)
    .algolia-docsearch-suggestion--content {
    background-color: ${t.colors.sidebar.itemHoverBackground} !important;
    color: inherit !important;
  }

  .algolia-autocomplete
    .algolia-docsearch-suggestion
    .algolia-docsearch-suggestion--content.algolia-docsearch-suggestion--no-results {
    max-width: 100% !important;
    width: 100% !important;
    font-weight: normal !important;
    padding: ${t.space[4]} ${t.space[3]} !important;
  }

  .algolia-autocomplete
    .algolia-docsearch-suggestion
    .algolia-docsearch-suggestion--content.algolia-docsearch-suggestion--no-results
    .algolia-docsearch-suggestion--title {
    margin-bottom: 0 !important;
  }

  .algolia-autocomplete
    .algolia-docsearch-suggestion
    .algolia-docsearch-suggestion--content.algolia-docsearch-suggestion--no-results
    .algolia-docsearch-suggestion--text {
    color: inherit !important;
    font-weight: normal !important;
  }

  .algolia-autocomplete
    .algolia-docsearch-suggestion
    .algolia-docsearch-suggestion--content.algolia-docsearch-suggestion--no-results
    .algolia-docsearch-suggestion--text:after {
    content: "😔";
  }

  .algolia-autocomplete .algolia-docsearch-suggestion--category-header {
    border-color: ${t.colors.ui.border} !important;
    font-size: ${t.fontSizes[1]} !important;
    font-weight: bold !important;
    margin-top: 0 !important;
    padding: ${t.space[1]} ${t.space[3]} !important;
  }

  .searchWrap
    .algolia-autocomplete.algolia-autocomplete-right
    .ds-dropdown-menu::before {
    right: 7.125rem !important;
  }

  .algolia-autocomplete
    .algolia-docsearch-suggestion
    .algolia-docsearch-suggestion--content.algolia-docsearch-suggestion--no-results:before {
    display: none !important;
  }

  .algolia-autocomplete .algolia-docsearch-footer {
    border-top: 1px solid ${t.colors.ui.border} !important;
    height: 30px !important;
    margin-top: 0 !important;
    width: 100% !important;
  }

  .algolia-autocomplete .algolia-docsearch-footer--logo {
    width: 110px !important;
    height: 100% !important;
    margin-left: auto !important;
    margin-right: ${t.space[3]} !important;
  }

  ${t.mediaQueries.sm} {
    .algolia-autocomplete .algolia-docsearch-suggestion--category-header {
      color: ${t.colors.text} !important;
      font-weight: normal !important;
    }

    .algolia-autocomplete
      .algolia-docsearch-suggestion
      .algolia-docsearch-suggestion--subcategory-column {
      width: 30% !important;
      text-align: right !important;
      opacity: 1 !important;
      padding: ${t.space[3]} ${t.space[4]} !important;
    }

    /* stylelint-disable */
    .algolia-autocomplete .algolia-docsearch-suggestion--category-header {
      padding: ${t.space[3]} ${t.space[4]} !important;
    }
    /* stylelint-enable */

    .algolia-autocomplete .algolia-docsearch-suggestion--content {
      width: 70% !important;
      max-width: 70% !important;
      padding: ${t.space[3]} ${t.space[4]} !important;
    }

    .algolia-autocomplete .algolia-docsearch-suggestion--content:before,
    .algolia-autocomplete
      .algolia-docsearch-suggestion--subcategory-column:after {
      display: block !important;
      content: "" !important;
      position: absolute !important;
      top: 0 !important;
      height: 100% !important;
      width: 1px !important;
      background: ${t.colors.ui.border} !important;
    }

    .algolia-autocomplete
      .algolia-docsearch-suggestion--subcategory-column:after {
      right: 0 !important;
    }

    .algolia-autocomplete .algolia-docsearch-suggestion--content:before {
      left: -1px !important;
    }
  }

  ${t.mediaQueries.md} {
    .algolia-autocomplete .ds-dropdown-menu {
      top: 100% !important;
      position: absolute !important;
      max-width: 600px !important;
      min-width: 500px !important;
    }

    /* .searchWrap to beat docsearch.css' !important */
    .searchWrap
      .algolia-autocomplete.algolia-autocomplete-right
      .ds-dropdown-menu {
      right: 0 !important;
      left: inherit !important;
    }

    .searchWrap
      .algolia-autocomplete.algolia-autocomplete-right
      .ds-dropdown-menu::before {
      right: ${t.space[12]} !important;
    }
  }

  ${t.mediaQueries.lg} {
    .algolia-autocomplete .ds-dropdown-menu {
      max-width: 600px !important;
      min-width: 540px !important;
    }

    .algolia-autocomplete
      .algolia-docsearch-suggestion
      .algolia-docsearch-suggestion--subcategory-column {
      width: 35% !important;
    }

    .algolia-autocomplete .algolia-docsearch-suggestion--content {
      width: 65% !important;
      max-width: 65% !important;
    }
  }
`

class SearchForm extends Component {
  constructor() {
    super()
    this.state = { focussed: false }
    this.autocompleteSelected = this.autocompleteSelected.bind(this)
  }
  /**
   * Replace the default selection event, allowing us to do client-side
   * navigation thus avoiding a full page refresh.
   *
   * Ref: https://github.com/algolia/autocomplete.js#events
   */ autocompleteSelected(e) {
    e.stopPropagation()
    // Use an anchor tag to parse the absolute url (from autocomplete.js) into a relative url
    const a = document.createElement(`a`)
    a.href = e._args[0].url
    this.searchInput.blur()
    // Compare hash and slug and remove hash if both are same
    const paths = a.pathname.split(`/`).filter(el => el !== ``)
    const slug = paths[paths.length - 1]
    const path =
      `#${slug}` === a.hash ? `${a.pathname}` : `${a.pathname}${a.hash}`
    navigate(path)
  }
  init() {
    if (this.algoliaInitialized) {
      return
    }

    window.addEventListener(
      `autocomplete:selected`,
      this.autocompleteSelected,
      true
    )
    window.docsearch({
      apiKey: `71af1f9c4bd947f0252e17051df13f9c`,
      indexName: `gatsbyjs`,
      inputSelector: `#doc-search`,
      debug: false,
      autocompleteOptions: {
        openOnFocus: true,
        autoselect: true,
        hint: false,
        keyboardShortcuts: [`s`],
      },
    })
    this.algoliaInitialized = true
  }
  componentDidMount() {
    if (
      typeof window === `undefined` ||
      typeof window.docsearch === `undefined`
    ) {
      // Algolia's docsearch lib not loaded yet so load it.
      // Lazy load css
      const path = `https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.css`
      const link = document.createElement(`link`)
      link.setAttribute(`rel`, `stylesheet`)
      link.setAttribute(`type`, `text/css`)
      link.setAttribute(`href`, path)
      document.head.appendChild(link)
    }
  }
  componentWillUnmount() {
    window.removeEventListener(
      `autocomplete:selected`,
      this.autocompleteSelected,
      true
    )
  }
  loadAlgoliaJS() {
    if (!loadedJs) {
      loadJS().then(a => {
        loadedJs = true
        window.docsearch = a.default
        this.init()
      })
    } else {
      this.init()
    }
  }
  render() {
    const { focussed } = this.state
    return (
      <form
        sx={{
          alignItems: `flex-end`,
          justifyContent: `flex-end`,
          display: `flex`,
          flex: [`1 1 auto`, null, `1 0 auto`, null, `0 0 auto`, `1 0 auto`],
          flexDirection: `row`,
          mb: 0,
          mx: [3, null, null, 4],
          position: `relative`,
          // minWidth: [null, null, null, null, `12rem`],
          // maxWidth: [`100%`, `100%`, `100%`, null, `24rem`],
          "& .algolia-autocomplete": {
            width: `100%`,
            display: `block !important`,
          },
        }}
        className="searchWrap"
        onMouseOver={() => this.loadAlgoliaJS()}
        onClick={() => this.loadAlgoliaJS()}
        onSubmit={e => e.preventDefault()}
      >
        <Global styles={algoliaStyles} />
        <label
          sx={{
            position: `relative`,
            width: [`100%`, `100%`, `100%`, focussed ? `14rem` : 24, `100%`],
            transition: t =>
              `width ${t.transition.speed.default} ${t.transition.curve.default}, padding ${t.transition.speed.default} ${t.transition.curve.default}`,
          }}
        >
          <input
            id="doc-search"
            sx={{
              ...themedInput,
              bg: [
                `themedInput.background`,
                null,
                null,
                focussed ? `themedInput.background` : `transparent`,
                `themedInput.background`,
              ],
              pl: [7, null, null, focussed ? 7 : 24, 7],
              width: [`100%`, null, null, focussed ? `14rem` : 24, `100%`],
              transition: t =>
                `width ${t.transition.speed.default} ${t.transition.curve.default}, padding ${t.transition.speed.default} ${t.transition.curve.default}`,
            }}
            type="search"
            placeholder={`Search gatsbyjs.org`}
            aria-label="Search gatsbyjs.org"
            title="Hit 's' to search docs"
            onFocus={() => this.setState({ focussed: true })}
            onBlur={() => this.setState({ focussed: false })}
            ref={input => {
              this.searchInput = input
            }}
          />
          <SearchIcon focussed={focussed} />
        </label>
      </form>
    )
  }
}

export default SearchForm
