import React, { Component } from "react"
import {
  InstantSearch,
  SearchBox,
  Stats,
  RefinementList,
  InfiniteHits,
  Toggle,
} from "react-instantsearch/dom"
import { colors } from "../utils/presets"
import Link from "gatsby-link"
import DownloadArrow from "react-icons/lib/go/arrow-small-down"
import AlgoliaLogo from "../assets/algolia.svg"
import debounce from "lodash/debounce"
import unescape from "lodash/unescape"

import presets from "../utils/presets"
import typography, { rhythm, scale } from "../utils/typography"
import { css as glam } from "glamor"
// This is for the urlSync
const updateAfter = 700

glam.insert(`
  .ais-SearchBox__input:valid ~ .ais-SearchBox__reset {
    display: block;
  }

  .ais-SearchBox__root {
    display: inline-block;
    position: relative;
    margin: 0;
    width: 100%;
    height: 46px;
    white-space: nowrap;
    box-sizing: border-box;
  }

  .ais-SearchBox__wrapper {
    width: 100%;
    height: 100%;
  }

  .ais-SearchBox__input {
    -webkit-appearance: none;
    display: inline-block;
    -webkit-transition: box-shadow 0.4s ease, background 0.4s ease;
    transition: box-shadow 0.4s ease, background 0.4s ease;
    border: 1px solid #e0d6eb;
    border-radius: 4px;
    color: ${colors.gatsby};
    background: #ffffff;
    padding: 0;
    padding-right: 36px;
    padding-left: 46px;
    width: 100%;
    height: 100%;
    vertical-align: middle;
    white-space: normal;
    font-size: inherit;
    font-family: ${typography.options.headerFontFamily.join(`,`)};
  }
  .ais-SearchBox__input:hover,
  .ais-SearchBox__input:active,
  .ais-SearchBox__input:focus {
    box-shadow: none;
    outline: 0;
  }
  .ais-SearchBox__input::-webkit-input-placeholder,
  .ais-SearchBox__input::-moz-placeholder,
  .ais-SearchBox__input:-ms-input-placeholder,
  .ais-SearchBox__input::placeholder {
    color: ${colors.lilac};
  }

  .ais-SearchBox__submit {
    position: absolute;
    top: 0;
    right: inherit;
    left: 0;
    margin: 0;
    border: 0;
    border-radius: 4px 0 0 4px;
    background-color: rgba(255, 255, 255, 0);
    padding: 0;
    width: 46px;
    height: 100%;
    vertical-align: middle;
    text-align: center;
    font-size: inherit;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .ais-SearchBox__submit::before {
    display: inline-block;
    margin-right: -4px;
    height: 100%;
    vertical-align: middle;
    content: "" 2;
  }
  .ais-SearchBox__submit:hover,
  .ais-SearchBox__submit:active {
    cursor: pointer;
  }
  .ais-SearchBox__submit:focus {
    outline: 0;
  }
  .ais-SearchBox__submit svg {
    width: 18px;
    height: 18px;
    vertical-align: middle;
    fill: ${colors.ui.bright};
  }

  .ais-SearchBox__reset {
    display: none;
    position: absolute;
    top: 13px;
    right: 13px;
    margin: 0;
    border: 0;
    background: none;
    cursor: pointer;
    padding: 0;
    font-size: inherit;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    fill: ${colors.ui.bright};
  }
  .ais-SearchBox__reset:focus {
    outline: 0;
  }
  .ais-SearchBox__reset svg {
    display: block;
    margin: 4px;
    width: 12px;
    height: 12px;
  }

  .ais-InfiniteHits__loadMore {
    width: 100%;
    height: ${rhythm(2)};
    border-radius: ${presets.radius}px;
    border: 1px solid ${colors.gatsby};
    margin-top: 0;
    cursor: pointer;
    background-color: transparent;
    color: ${colors.gatsby};
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
`)

// Search shows a list of "hits", and is a child of the SearchBar component
class Search extends Component {
  constructor(props, context) {
    super(props)
  }

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
            display: `flex`,
            justifyContent: `center`,
            width: `100%`,
          }}
        >
          <SearchBox translations={{ placeholder: `Search Gatsby Library` }} />
        </div>

        <div
          css={{
            display: `none`,
          }}
        >
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
            height: rhythm(1.5),
            paddingTop: rhythm(0.25),
            paddingBottom: rhythm(0.25),
            color: colors.gray.calm,
            fontSize: 14,
            fontStretch: `normal`,
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

        <div>
          <div
            css={{
              backgroundColor: `white`,
              [presets.Tablet]: {
                height: `calc(100vh - 225px)`,
                overflowY: `scroll`,
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
              },
            }}
          >
            <InfiniteHits
              hitComponent={result => (
                <Result
                  hit={result.hit}
                  pathname={this.props.pathname}
                  search={this.props.searchState}
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
          }}
        >
          Search by{` `}
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
const Result = ({ hit, pathname, search }) => {
  // Example:
  // pathname = `/plugins/gatsby-link/` || `/plugins/@comsoc/gatsby-mdast-copy-linked-files`
  //  hit.name = `gatsby-link` || `@comsoc/gatsby-mdast-copy-linked-files`
  const selected = pathname.includes(hit.name)
  return (
    <Link
      to={{
        pathname: `/packages/${hit.name}/`,
        search: `?=${search}`,
      }}
      css={{
        "&&": {
          display: `block`,
          fontFamily: typography.options.bodyFontFamily.join(`,`),
          fontWeight: `400`,
          color: colors.gray.dark,
          borderLeft: `${rhythm(3 / 16)} solid ${
            selected ? colors.gatsby : `none`
          }`,
          padding: rhythm(0.5),
          paddingLeft: selected ? rhythm(5 / 16) : rhythm(1 / 2),
          boxShadow: `none`,
          borderBottom: 0,
          position: `relative`,
          "&:after": {
            content: ` `,
            position: `absolute`,
            bottom: 0,
            top: `auto`,
            width: `100%`,
            height: 1,
            left: 0,
            background: colors.ui.light,
          },
        },
      }}
    >
      <div
        css={{
          display: `flex`,
          justifyContent: `space-between`,
        }}
      >
        <div
          css={{
            fontFamily: typography.options.headerFontFamily.join(`,`),
            fontWeight: `bold`,
          }}
        >
          {hit.name}
        </div>

        <div
          css={{
            display: `flex`,
            alignItems: `center`,
            fontSize: rhythm(0.5),
          }}
        >
          {hit.humanDownloadsLast30Days}

          <DownloadArrow
            style={{
              width: 25,
              height: 25,
            }}
            color="#000"
          />
        </div>
      </div>

      <div
        css={{
          color: colors.gray.calm,
          fontSize: scale(-1 / 5).fontSize,
          fontFamily: typography.options.headerFontFamily.join(`,`),
        }}
      >
        {unescape(hit.description)}
      </div>
    </Link>
  )
}

// the search bar holds the Search component in the InstantSearch widget
class SearchBar extends Component {
  constructor(props) {
    super(props)
    this.state = { searchState: { query: this.urlToSearch(), page: 1 } }
    this.updateHistory = debounce(this.updateHistory, updateAfter)
  }

  urlToSearch = () => this.props.history.location.search.slice(2)

  updateHistory(value) {
    this.props.history.replace({
      pathname: window.location.pathname,
      search: `?=${value.query}`,
    })
  }

  onSearchStateChange(searchState) {
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
          onSearchStateChange={this.onSearchStateChange.bind(this)}
        >
          <Search
            pathname={this.props.history.location.pathname}
            searchState={this.state.searchState.query}
          />
        </InstantSearch>
      </div>
    )
  }
}

export default SearchBar
