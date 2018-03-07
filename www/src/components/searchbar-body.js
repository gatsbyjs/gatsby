import React, { Component } from "react"
import {
  InstantSearch,
  SearchBox,
  Stats,
  RefinementList,
  InfiniteHits,
} from "react-instantsearch/dom"
import { colors } from "../utils/presets"
import Link from "gatsby-link"
import DownloadArrow from "react-icons/lib/go/arrow-small-down"
import debounce from "lodash/debounce"
import unescape from "lodash/unescape"
import algoliasearch from "algoliasearch/lite"
let alClient
let alIndex

import typography, { rhythm, scale } from "../utils/typography"
import { css as glam } from "glamor"
// This is for the urlSync
const updateAfter = 700
//

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
    margin-top: ${rhythm(1 / 2)};
    cursor: pointer;
    background-color: transparent;
    color: ${colors.gatsby};
    outline: none;
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
    this.state = {
      searchState: this.props.searchState,
    }
  }

  render() {
    return (
      <div className="container">
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
              height: `calc(100vh - 225px)`,
              border: `2 px solid red`,
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
            }}
          >
            <InfiniteHits
              hitComponent={result => (
                <Result hit={result.hit} pathname={this.props.pathname} />
              )}
            />
          </div>
        </div>

        <div>
          <h3
            css={{
              fontSize: rhythm(0.55),
              textAlign: `center`,
              margin: rhythm(0.75),
              fontWeight: `normal`,
              "@media (min-width: 1600px)": {
                margin: rhythm(0.25),
                fontSize: rhythm(0.5),
              },
            }}
          >
            Search by{` `}
            <a
              href={`https://www.algolia.com/`}
              style={{
                color: `#744C9E`,
                border: `none`,
                boxShadow: `none`,
                fontWeight: `normal`,
              }}
            >
              Algolia
            </a>
          </h3>
        </div>
      </div>
    )
  }
}

// the result component is fed into the InfiniteHits component
const Result = ({ hit, pathname }) => {
  const selected = pathname.slice(10) === hit.name
  return (
    <Link
      to={`/packages/${hit.name}`}
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
    this.props.history.replace(`/packages?=${value.query}`)
  }

  onSearchStateChange(searchState) {
    this.updateHistory(searchState)
    this.setState({ searchState })
  }

  render() {
    return (
      <div>
        <InstantSearch
          apiKey="f54e21fa3a2a0160595bb058179bfb1e"
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
