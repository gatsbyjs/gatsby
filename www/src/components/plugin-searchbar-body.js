import React, { Component } from "react"
import {
  InstantSearch,
  SearchBox,
  Stats,
  RefinementList,
  InfiniteHits,
  Toggle,
} from "react-instantsearch/dom"
import { navigate as reachNavigate } from "@reach/router"
import { colors } from "../utils/presets"
import { Link } from "gatsby"
import DownloadArrow from "react-icons/lib/md/file-download"
import AlgoliaLogo from "../assets/algolia.svg"
import debounce from "lodash/debounce"
import unescape from "lodash/unescape"

import presets from "../utils/presets"
import typography, { rhythm, scale } from "../utils/typography"
import { scrollbarStyles } from "../utils/styles"
import { injectGlobal } from "react-emotion"
import removeMD from "remove-markdown"

// This is for the urlSync
const updateAfter = 700

// A couple constants for CSS
const searchInputHeight = rhythm(7 / 4)
const searchMetaHeight = rhythm(8 / 4)
const searchInputWrapperMargin = rhythm(3 / 4)

/* stylelint-disable */
injectGlobal`
  .ais-SearchBox__input:valid ~ .ais-SearchBox__reset {
    display: block;
  }

  .ais-SearchBox__root {
    display: inline-block;
    position: relative;
    margin: 0;
    width: 100%;
    height: auto;
    white-space: nowrap;
    box-sizing: border-box;
  }

  .ais-SearchBox__wrapper {
    height: calc(${searchInputHeight} + ${searchInputWrapperMargin});
    display: flex;
    align-items: flex-end;
  }

  .ais-SearchBox__input {
    -webkit-appearance: none;
    background: #fff;
    border: 1px solid ${colors.ui.bright};
    border-radius: ${presets.radiusLg}px;
    color: ${colors.gatsby};
    display: inline-block;
    font-size: 18px;
    font-family: ${typography.options.headerFontFamily.join(`,`)};
    height: ${searchInputHeight};
    padding: 0;
    padding-right: ${searchInputHeight};
    padding-left: ${searchInputHeight};
    margin: 0 ${searchInputWrapperMargin};
    -webkit-transition: box-shadow 0.4s ease, background 0.4s ease;
    transition: box-shadow 0.4s ease, background 0.4s ease;
    vertical-align: middle;
    white-space: normal;
    width: calc(100% - ${rhythm(6 / 4)});
  }
  .ais-SearchBox__input:hover,
  .ais-SearchBox__input:active,
  .ais-SearchBox__input:focus {
    box-shadow: none;
    outline: 0;
  }

  .ais-SearchBox__input:active,
  .ais-SearchBox__input:focus {
    border-color: ${colors.lilac};
    box-shadow: 0 0 0 3px ${colors.ui.bright};
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .ais-SearchBox__input::-webkit-input-placeholder,
  .ais-SearchBox__input::-moz-placeholder,
  .ais-SearchBox__input:-ms-input-placeholder,
  .ais-SearchBox__input::placeholder {
    color: ${colors.lilac};
  }

  .ais-SearchBox__submit,
  .ais-SearchBox__reset {
    position: absolute;
    margin: 0;
    border: 0;
    background-color: transparent;
    padding: 0;
    cursor: pointer;
    width: ${searchInputHeight};
    height: ${searchInputHeight};
    text-align: center;
    font-size: inherit;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .ais-SearchBox__submit {
    top: ${searchInputWrapperMargin};
    right: inherit;
    left: ${searchInputWrapperMargin};
    border-radius: ${presets.radiusLg}px 0 0 ${presets.radiusLg}px;
  }
  .ais-SearchBox__submit:focus {
    outline: 0;
  }
  .ais-SearchBox__submit svg {
    width: 1rem;
    height: 1rem;
    vertical-align: middle;
    fill: ${colors.ui.bright};
  }

  .ais-SearchBox__reset {
    display: none;
    top: ${searchInputWrapperMargin};
    left: auto;
    right: ${searchInputWrapperMargin};
    font-size: inherit;
  }
  .ais-SearchBox__reset:focus {
    outline: 0;
  }
  .ais-SearchBox__reset:hover svg {
    fill: ${colors.gatsby};
  }
  .ais-SearchBox__reset svg {
    fill: ${colors.ui.bright};
    width: 12px;
    height: 12px;
    vertical-align: middle;
  }

  .ais-InfiniteHits__loadMore {
    background-color: transparent;
    border: 1px solid ${colors.gatsby};
    border-radius: ${presets.radius}px;
    color: ${colors.gatsby};
    cursor: pointer;
    width: calc(100% - ${rhythm(6 / 4)});
    margin: ${rhythm(3 / 4)};
    height: ${rhythm(2)};
    outline: none;
    transition: all ${presets.animation.speedDefault} ${
  presets.animation.curveDefault
};
    font-family: ${typography.options.headerFontFamily.join(`,`)};
  }
  .ais-InfiniteHits__loadMore:hover {
    background-color: ${colors.gatsby};
    color: #fff;
  }

  .ais-InfiniteHits__loadMore[disabled] {
    display: none;
  }
`
/* stylelint-enable */

// Search shows a list of "hits", and is a child of the PluginSearchBar component
class Search extends Component {
  render() {
    return (
      <div
        css={{
          paddingBottom: rhythm(2.5),
          [presets.Tablet]: {
            paddingBottom: 0,
          },
        }}
      >
        <div
          css={{
            borderBottom: `1px solid ${colors.ui.light}`,
            display: `flex`,
            flexDirection: `column`,
            width: `100%`,
          }}
        >
          <SearchBox translations={{ placeholder: `Search Gatsby Library` }} />

          <div css={{ display: `none` }}>
            <RefinementList
              attributeName="keywords"
              defaultRefinement={[`gatsby-component`, `gatsby-plugin`]}
            />
            <Toggle
              attributeName="deprecated"
              value={false}
              label="No deprecated plugins"
              defaultRefinement={true}
            />
          </div>

          <div
            css={{
              alignItems: `center`,
              color: colors.gray.calm,
              display: `flex`,
              fontFamily: typography.options.headerFontFamily.join(`,`),
              fontSize: scale(1),
              height: searchMetaHeight,
              paddingLeft: rhythm(3 / 4),
              paddingRight: rhythm(3 / 4),
              [presets.Tablet]: {
                fontSize: scale(-1 / 4).fontSize,
              },
            }}
          >
            <Stats
              translations={{
                stats: function(n, ms) {
                  return `${n} results`
                },
              }}
            />
          </div>
        </div>

        <div>
          <div
            css={{
              [presets.Tablet]: {
                height: `calc(100vh - ${presets.headerHeight} - ${
                  presets.bannerHeight
                } - ${searchInputHeight} - ${searchInputWrapperMargin} - ${searchMetaHeight})`,
                overflowY: `scroll`,
                ...scrollbarStyles,
              },
            }}
          >
            <InfiniteHits
              hitComponent={result => (
                <Result
                  hit={result.hit}
                  pathname={this.props.pathname}
                  query={this.props.query}
                />
              )}
            />
          </div>
        </div>

        <div
          css={{
            fontSize: 0,
            lineHeight: 0,
            height: 20,
            marginTop: rhythm(3 / 4),
            display: `none`,
          }}
        >
          <a
            href={`https://www.algolia.com/`}
            css={{
              "&&": {
                background: `url(${AlgoliaLogo})`,
                border: `none`,
                boxShadow: `none`,
                fontWeight: `normal`,
                backgroundRepeat: `no-repeat`,
                backgroundPosition: `50%`,
                backgroundSize: `100%`,
                overflow: `hidden`,
                textIndent: `-9000px`,
                padding: `0!important`,
                width: 110,
                height: `100%`,
                display: `block`,
                marginLeft: `auto`,
                "&:hover": {
                  background: `url(${AlgoliaLogo})`,
                  backgroundRepeat: `no-repeat`,
                  backgroundPosition: `50%`,
                  backgroundSize: `100%`,
                },
              },
            }}
          >
            Algolia
          </a>
        </div>
      </div>
    )
  }
}

// the result component is fed into the InfiniteHits component
const Result = ({ hit, pathname, query }) => {
  // Example:
  // pathname = `/plugins/gatsby-link/` || `/plugins/@comsoc/gatsby-mdast-copy-linked-files`
  //  hit.name = `gatsby-link` || `@comsoc/gatsby-mdast-copy-linked-files`
  const selected = pathname.includes(hit.name)
  return (
    <Link
      to={`/packages/${hit.name}/?=${query}`}
      css={{
        "&&": {
          boxShadow: `none`,
          background: selected ? `#fff` : false,
          borderBottom: 0,
          color: colors.gray.dark,
          display: `block`,
          fontWeight: `400`,
          padding: rhythm(3 / 4),
          position: `relative`,
          transition: `all ${presets.animation.speedDefault} ${
            presets.animation.curveDefault
          }`,
          zIndex: selected ? 1 : false,
          "&:hover": {
            background: selected ? `#fff` : colors.ui.border,
          },
          "&:before": {
            background: colors.ui.border,
            bottom: 0,
            content: `''`,
            height: 1,
            left: 0,
            position: `absolute`,
            top: `auto`,
            width: `100%`,
          },
          "&:after": {
            background: selected ? colors.gatsby : false,
            bottom: 0,
            content: `''`,
            position: `absolute`,
            left: 0,
            top: -1,
            width: 4,
          },
        },
      }}
    >
      <div
        css={{
          alignItems: `baseline`,
          display: `flex`,
          justifyContent: `space-between`,
          marginBottom: rhythm(typography.options.blockMarginBottom / 2),
        }}
      >
        <div
          css={{
            color: selected ? colors.gatsby : false,
            fontFamily: typography.options.headerFontFamily.join(`,`),
            fontWeight: `bold`,
            lineHeight: 1.2,
          }}
        >
          {hit.name}
        </div>
        <div
          css={{
            alignItems: `center`,
            color: selected ? colors.lilac : colors.gray.bright,
            display: `flex`,
            fontFamily: typography.options.headerFontFamily.join(`,`),
            fontSize: rhythm(4 / 7),
          }}
        >
          {hit.humanDownloadsLast30Days}
          {` `}
          <span
            css={{
              color: selected ? colors.lilac : colors.gray.bright,
              marginLeft: rhythm(1 / 6),
            }}
          >
            <DownloadArrow />
          </span>
        </div>
      </div>
      <div
        css={{
          color: selected ? `inherit` : colors.gray.calm,
          fontFamily: typography.options.systemFontFamily.join(`,`),
          fontSize: scale(-1 / 2).fontSize,
          lineHeight: 1.5,
        }}
      >
        {removeMD(unescape(hit.description))}
      </div>
    </Link>
  )
}

// the search bar holds the Search component in the InstantSearch widget
class PluginSearchBar extends Component {
  constructor(props) {
    super(props)
    this.state = { searchState: { query: this.urlToSearch(), page: 1 } }
    this.updateHistory = debounce(this.updateHistory, updateAfter)
  }

  urlToSearch = () => {
    if (this.props.location.search) {
      // ignore this automatically added query parameter
      return this.props.location.search.replace(`no-cache=1`, ``).slice(2)
    }
    return ``
  }

  updateHistory(value) {
    reachNavigate(`${this.props.location.pathname}?=${value.query}`, {
      replace: true,
    })
  }

  onSearchStateChange = searchState => {
    this.updateHistory(searchState)
    this.setState({ searchState })
  }

  render() {
    return (
      <div>
        <InstantSearch
          apiKey="ae43b69014c017e05950a1cd4273f404"
          appId="OFCNCOG2CU"
          indexName="npm-search"
          searchState={this.state.searchState}
          onSearchStateChange={this.onSearchStateChange}
        >
          <Search
            pathname={this.props.location.pathname}
            query={this.state.searchState.query}
          />
        </InstantSearch>
      </div>
    )
  }
}

export default PluginSearchBar
