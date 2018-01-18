import React, { Component } from "react"
import PropTypes from "prop-types"
import { navigateTo } from "gatsby-link"
import { rhythm } from "../utils/typography"
import presets from "../utils/presets"

import { css } from "glamor"

// Override default search result styles
css.global(`.searchWrap .algolia-docsearch-suggestion--highlight`, {
  backgroundColor: `${presets.lightPurple} !important`,
  boxShadow: `inset 0 -2px 0 0 ${presets.lightPurple} !important`,
  color: `black`,
  fontWeight: `bold`,
})
css.global(`.searchWrap .algolia-docsearch-suggestion .algolia-docsearch-suggestion--subcategory-column`, {
  width: `100% !important`,
})
css.global(`.searchWrap .algolia-docsearch-suggestion--subcategory-column-text:after`, {
  display: `none`,
})
css.global(
  `.searchWrap .algolia-autocomplete .ds-dropdown-menu .ds-suggestion.ds-cursor .algolia-docsearch-suggestion:not(.suggestion-layout-simple) .algolia-docsearch-suggestion--content`,
  { backgroundColor: `${presets.brandLighter} !important` }
)
css.global(
  `.searchWrap .algolia-docsearch-suggestion .algolia-docsearch-suggestion--content.algolia-docsearch-suggestion--no-results`,
  {
    maxWidth: `100%`,
    paddingLeft: `0 !important`,
    width: `100% !important`,
  }
)
css.global(
  `.searchWrap .algolia-docsearch-suggestion .algolia-docsearch-suggestion--content.algolia-docsearch-suggestion--no-results:before`,
  { display: `none !important` }
)
css.global(`.searchWrap .algolia-autocomplete .ds-dropdown-menu`, {
  position: `fixed !important`,
  top: `${rhythm(2)} !important`,
  left: `${rhythm(0.5)} !important`,
  right: `${rhythm(0.5)} !important`,
  minWidth: `calc(100vw - ${rhythm(1)})`,
  maxWidth: `calc(100vw - 2rem)`,
  maxHeight: `calc(100vh - 5rem)`,
  display: `block`,
})
css.global(
  `.searchWrap .algolia-autocomplete.algolia-autocomplete-right .ds-dropdown-menu, .algolia-autocomplete.algolia-autocomplete-left .ds-dropdown-menu`,
  {
    left: `${rhythm(0.5)} !important`,
    right: `${rhythm(0.5)} !important`,
  }
)
css.global(
  `.searchWrap .algolia-autocomplete.algolia-autocomplete-right .ds-dropdown-menu::before`,
  {
    right: rhythm(5),
  }
)
css.global(
  `.searchWrap .algolia-autocomplete.algolia-autocomplete-left .ds-dropdown-menu::before`,
  {
    left: rhythm(7),
  }
)

// use css.insert() for media query with global CSS
css.insert(`@media ${presets.phablet}{
  .searchWrap .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--subcategory-column {
    font-weight: 400;
    width: 30% !important;
    text-align: right;
    opacity: 1;
    padding: ${rhythm(0.5)} ${rhythm(1)} ${rhythm(0.5)} 0;
  }
  .searchWrap .algolia-autocomplete .algolia-docsearch-suggestion--subcategory-column:before {
    content: "";
    position: absolute;
    display: block !important;
    top: 0;
    height: 100%;
    width: 1px;
    background: #ddd;
    right: 0;
  }
  .searchWrap .algolia-autocomplete .algolia-docsearch-suggestion--subcategory-column:after {
    display: none;
  }
  .searchWrap .algolia-autocomplete .algolia-docsearch-suggestion--content {
    width: 70% !important;
    max-width: 70%;
    display: block;
    padding: ${rhythm(0.5)} 0 ${rhythm(0.5)} ${rhythm(1)} !important;
  }
  .searchWrap .algolia-autocomplete .algolia-docsearch-suggestion--content:before {
    content: "";
    position: absolute;
    display: block !important;
    top: 0;
    height: 100%;
    width: 1px;
    background: #ddd;
    left: -1px;
  }
}`)

css.insert(`@media ${presets.tablet}{
  .searchWrap .algolia-autocomplete .ds-dropdown-menu {
    top: 100% !important;
    position: absolute !important;
    max-width: 600px !important;
    min-width: 500px !important;
  }
  .searchWrap .algolia-autocomplete.algolia-autocomplete-right .ds-dropdown-menu {
    right: 0 !important;
    left: inherit !important;
  }
  .searchWrap .algolia-autocomplete.algolia-autocomplete-right .ds-dropdown-menu::before {
    right: ${rhythm(2)};
  }
}`)

class SearchForm extends Component {
  constructor() {
    super()
    this.state = { enabled: true }
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
    navigateTo(`${a.pathname}${a.hash}`)
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
        className="searchWrap"
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
