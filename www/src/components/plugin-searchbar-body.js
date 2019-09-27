import React, { Component } from "react"
import {
  InstantSearch,
  Configure,
  SearchBox,
  Stats,
  RefinementList,
  InfiniteHits,
  ToggleRefinement,
} from "react-instantsearch-dom"
import { navigate as reachNavigate } from "@reach/router"
import { Link } from "gatsby"
import ArrowDownwardIcon from "react-icons/lib/md/arrow-downward"
import AlgoliaLogo from "../assets/vendor-logos/algolia.svg"
import GatsbyIcon from "../assets/monogram.svg"
import { debounce, unescape } from "lodash-es"

import {
  space,
  colors,
  fontSizes,
  transition,
  radii,
  mediaQueries,
  sizes,
  fonts,
} from "../utils/presets"
import { rhythm } from "../utils/typography"
import { skipLink, formInput, formInputFocus } from "../utils/styles"
import { Global, css } from "@emotion/core"
import styled from "@emotion/styled"
import removeMD from "remove-markdown"
import VisuallyHidden from "@reach/visually-hidden"
import { SkipNavLink } from "@reach/skip-nav"

// This is for the urlSync
const updateAfter = 700

// A couple constants for CSS
const searchInputHeight = rhythm(7 / 4)
const searchMetaHeight = rhythm(8 / 4)
const searchInputWrapperMargin = space[6]

/* stylelint-disable */
const searchBoxStyles = css`
  .ais-SearchBox-input:valid ~ .ais-SearchBox-reset {
    display: block;
  }

  .ais-SearchBox {
    display: inline-block;
    position: relative;
    margin: 0;
    width: 100%;
    height: auto;
    white-space: nowrap;
    box-sizing: border-box;
  }

  .ais-SearchBox-form {
    height: calc(${searchInputHeight} + ${searchInputWrapperMargin});
    display: flex;
    align-items: flex-end;
    margin-bottom: 0;
  }

  .ais-SearchBox-input {
    ${formInput}
    -webkit-appearance: none;
    display: inline-block;
    height: ${searchInputHeight};
    padding: 0;
    padding-right: ${searchInputHeight};
    padding-left: ${searchInputHeight};
    margin: 0 ${searchInputWrapperMargin};
    transition: box-shadow ${transition.speed.default}
        ${transition.curve.default},
      background ${transition.speed.default} ${transition.curve.default};
    vertical-align: middle;
    white-space: normal;
    width: calc(100% - ${rhythm(6 / 4)});
  }
  .ais-SearchBox-input:hover,
  .ais-SearchBox-input:active,
  .ais-SearchBox-input:focus {
    box-shadow: none;
    outline: 0;
  }

  .ais-SearchBox-input:active,
  .ais-SearchBox-input:focus {
    ${formInputFocus}
  }

  .ais-SearchBox-input::-webkit-input-placeholder,
  .ais-SearchBox-input::-moz-placeholder,
  .ais-SearchBox-input:-ms-input-placeholder,
  .ais-SearchBox-input::placeholder {
    color: ${colors.text.placeholder};
  }

  .ais-SearchBox-submit,
  .ais-SearchBox-reset {
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

  .ais-SearchBox-submit {
    top: ${searchInputWrapperMargin};
    right: inherit;
    left: ${searchInputWrapperMargin};
    border-radius: ${radii[2]}px 0 0 ${radii[2]}px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .ais-SearchBox-submit:focus {
    outline: 0;
  }
  .ais-SearchBox-submit:focus svg {
    fill: ${colors.lilac};
  }
  .ais-SearchBox-submit svg {
    width: ${space[4]};
    height: ${space[4]};
    fill: ${colors.text.placeholder};
  }

  .ais-SearchBox-reset {
    display: none;
    top: ${searchInputWrapperMargin};
    left: auto;
    right: ${searchInputWrapperMargin};
    font-size: inherit;
  }
  .ais-SearchBox-reset:focus {
    outline: 0;
  }
  .ais-SearchBox-reset:hover svg,
  .ais-SearchBox-reset:focus svg {
    fill: ${colors.gatsby};
  }
  .ais-SearchBox-reset svg {
    fill: ${colors.text.placeholder};
    width: ${space[3]};
    height: ${space[3]};
    vertical-align: middle;
  }
  .ais-SearchBox-input:valid ~ .ais-SearchBox-reset {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .ais-InfiniteHits-list {
    list-style: none;
    margin-left: 0;
    margin-bottom: 0;
  }

  .ais-InfiniteHits-item {
    margin-bottom: 0;
  }

  .ais-InfiniteHits-loadMore {
    background-color: transparent;
    border: 1px solid ${colors.gatsby};
    border-radius: ${radii[1]}px;
    color: ${colors.gatsby};
    cursor: pointer;
    width: calc(100% - ${rhythm(space[6] * 2)});
    margin: ${space[6]};
    height: ${space[9]};
    outline: none;
    transition: all ${transition.speed.default} ${transition.curve.default};
    font-family: ${fonts.header};
  }

  .ais-InfiniteHits-loadMore:hover,
  .ais-InfiniteHits-loadMore:focus {
    background-color: ${colors.gatsby};
    color: ${colors.white};
  }

  .ais-InfiniteHits-loadMore[disabled] {
    display: none;
  }
`
/* stylelint-enable */

const StyledSkipNavLink = styled(SkipNavLink)({ ...skipLink })

// Search shows a list of "hits", and is a child of the PluginSearchBar component
class Search extends Component {
  render() {
    return (
      <div
        css={{
          paddingBottom: rhythm(2.5),
          [mediaQueries.md]: {
            paddingBottom: 0,
          },
        }}
      >
        <div
          css={{
            borderBottom: `1px solid ${colors.ui.border.subtle}`,
            display: `flex`,
            flexDirection: `column`,
            width: `100%`,
          }}
        >
          <Global styles={searchBoxStyles} />
          <SearchBox translations={{ placeholder: `Search Gatsby Library` }} />

          <div css={{ display: `none` }}>
            <Configure analyticsTags={[`gatsby-plugins`]} />
            <RefinementList
              attribute="keywords"
              transformItems={items =>
                items.map(({ count, ...item }) => {
                  return {
                    ...item,
                    count: count || 0,
                  }
                })
              }
              defaultRefinement={[`gatsby-component`, `gatsby-plugin`]}
            />
            <ToggleRefinement
              attribute="deprecated"
              value={false}
              label="No deprecated plugins"
              defaultRefinement={true}
            />
          </div>

          <div
            css={{
              alignItems: `center`,
              color: colors.text.secondary,
              display: `flex`,
              height: searchMetaHeight,
              paddingLeft: space[6],
              paddingRight: space[6],
              fontSize: fontSizes[0],
            }}
          >
            <Stats
              translations={{
                stats: function(n, ms) {
                  return `${n} results`
                },
              }}
            />
            <StyledSkipNavLink>Skip to main content</StyledSkipNavLink>
          </div>
        </div>

        <div>
          <div
            css={{
              [mediaQueries.md]: {
                height: `calc(100vh - ${sizes.headerHeight} - ${sizes.bannerHeight} - ${searchInputHeight} - ${searchInputWrapperMargin} - ${searchMetaHeight})`,
                overflowY: `scroll`,
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
            marginTop: space[6],
            display: `none`,
          }}
        >
          <a
            href={`https://www.algolia.com/`}
            css={{
              "&&": {
                background: `url(${AlgoliaLogo})`,
                border: `none`,
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
  // pathname = `/packages/gatsby-link/` || `/packages/@comsoc/gatsby-mdast-copy-linked-files`
  //  hit.name = `gatsby-link` || `@comsoc/gatsby-mdast-copy-linked-files`
  const selected = new RegExp(`^/packages/${hit.name}/?$`).test(pathname)
  return (
    <Link
      to={`/packages/${hit.name}/?=${query}`}
      aria-current={selected ? `true` : undefined}
      css={{
        "&&": {
          background: selected ? colors.ui.hover : false,
          borderBottom: 0,
          display: `block`,
          fontWeight: `400`,
          padding: `${space[5]} ${space[6]}`,
          position: `relative`,
          transition: `all ${transition.speed.default} ${transition.curve.default}`,
          zIndex: selected ? 1 : false,
          "&:hover": {
            background: selected ? colors.ui.hover : colors.white,
          },
          "&:before": {
            background: colors.ui.border.subtle,
            bottom: 0,
            content: `''`,
            height: 1,
            left: 0,
            position: `absolute`,
            top: `auto`,
            width: `100%`,
            [mediaQueries.md]: {
              display: `none`,
            },
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
          marginBottom: space[3],
        }}
      >
        <h2
          css={{
            alignItems: `center`,
            color: selected ? colors.gatsby : false,
            display: `flex`,
            fontFamily: fonts.system,
            fontSize: fontSizes[1],
            fontWeight: `bold`,
            marginBottom: 0,
            marginTop: 0,
          }}
        >
          {hit.name}
        </h2>
        <div>
          <VisuallyHidden>
            {hit.downloadsLast30Days} monthly downloads
          </VisuallyHidden>
        </div>
        <div
          aria-hidden
          css={{
            alignItems: `center`,
            color: selected ? colors.lilac : colors.text.secondary,
            display: `flex`,
            fontSize: fontSizes[0],
          }}
        >
          {hit.repository &&
            hit.name[0] !== `@` &&
            hit.repository.url.indexOf(`https://github.com/gatsbyjs/gatsby`) ===
              0 && (
              <img
                src={GatsbyIcon}
                css={{
                  height: 12,
                  marginBottom: 0,
                  marginRight: 4,
                  filter: selected ? false : `grayscale(100%)`,
                  opacity: selected ? false : `0.2`,
                }}
                alt={`Official Gatsby Plugin`}
              />
            )}
          <span
            css={{
              width: `5em`,
              textAlign: `right`,
            }}
          >
            {hit.humanDownloadsLast30Days}
            {` `}
            <ArrowDownwardIcon />
          </span>
        </div>
      </div>
      <div
        css={{
          color: selected ? `inherit` : colors.text.secondary,
          fontSize: fontSizes[1],
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
      const match = /(\?|&)=([^&]+)/.exec(this.props.location.search)
      if (match) return decodeURIComponent(match[2])
      return ``
    }
    return ``
  }

  updateHistory(value) {
    reachNavigate(
      `${this.props.location.pathname}?=${encodeURIComponent(value.query)}`,
      {
        replace: true,
      }
    )
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
