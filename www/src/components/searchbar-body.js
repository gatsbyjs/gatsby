import React, { Component } from "react"
import {
  InstantSearch,
  Hits,
  SearchBox,
  Stats,
  RefinementList,
  InfiniteHits,
} from "react-instantsearch/dom"
import distanceInWords from "date-fns/distance_in_words"
import presets, { colors } from "../utils/presets"
import Link from "gatsby-link"
import DownloadArrow from "react-icons/lib/go/arrow-small-down"
import { debounce } from "lodash"

import typography, { rhythm } from "../utils/typography"

// This is for the urlSync
const updateAfter = 700
//

const wideScreenSize = {
  "@media (min-width: 1600px)": {
    margin: rhythm(0.25),
    fontSize: rhythm(0.5),
  },
}

// Search shows a list of "hits", and is a child of the SearchBar component
class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      searchState: this.props.searchState,
    }
  }
  render() {
    const emptySearchBox = this.props.searchState.length > 0 ? false : true
    return (
      <div className="container">
        <div
          css={{
            display: `flex`,
            justifyContent: `center`,
            width: `100%`,
          }}
        >
          <SearchBox translations={{ placeholder: "Search Gatsby Library" }} />
        </div>

        <div
          css={{
            display: `none`,
          }}
        >
          <RefinementList
            attributeName="keywords"
            defaultRefinement={["gatsby-component", "gatsby-plugin"]}
          />
        </div>

        <div
          css={{
            opacity: emptySearchBox ? 0 : 1,
            height: rhythm(1.5),
            paddingTop: rhythm(0.25),
            paddingBottom: rhythm(0.25),
            color: colors.gray.calm,
            fontSize: 14,
            fontStretch: "normal",
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

        <div
          css={{
            borderTop: `2px solid #F5F3F7`,
            borderBottom: `2px solid #F5F3F7`,
            borderLeft: `2px solid #F5F3F7`,
          }}
        >
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
              "@media (min-width: 1600px)": {
                margin: rhythm(0.25),
                fontSize: rhythm(0.5),
              },
            }}
          >
            Search by{" "}
            <a
              href={`https://www.algolia.com/`}
              style={{ color: `#744C9E`, border: `none`, boxShadow: `none` }}
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
  const lastUpdated = `${distanceInWords(
    new Date(hit.modified),
    new Date()
  )} ago`
  return (
    <Link
      to={`/packages/${hit.name}`}
      style={{
        display: `block`,
        fontFamily: typography.options.bodyFontFamily.join(`,`),
        fontWeight: `400`,
        color: selected ? `white` : `black`,
        backgroundColor: selected ? `#744C9E` : `white`,
        padding: rhythm(0.5),
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
          {selected ? (
            <DownloadArrow
              style={{
                width: 25,
                height: 25,
              }}
              color="#fff"
            />
          ) : (
            <DownloadArrow
              style={{
                width: 25,
                height: 25,
              }}
              color="#000"
            />
          )}
        </div>
      </div>

      <div
        css={{
          fontSize: rhythm(0.6),
          paddingTop: rhythm(0.25),
          lineHeight: rhythm(0.75),
        }}
      >
        {hit.description}
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

  urlToSearch = () => {
    return this.props.history.location.search.slice(2)
  }

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
