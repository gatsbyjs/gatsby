/** @jsx jsx */
import { jsx } from "theme-ui"
import { Component } from "react"
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
import { MdArrowDownward as ArrowDownwardIcon } from "react-icons/md"
import AlgoliaLogo from "../assets/vendor-logos/algolia.svg"
import GatsbyIcon from "./gatsby-monogram"
import { debounce, unescape } from "lodash-es"

import {
  space,
  mediaQueries,
} from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import { visuallyHidden } from "../utils/styles"
import { Global, css } from "@emotion/core"
import removeMD from "remove-markdown"
import SkipNavLink from "./skip-nav-link"

// This is for the urlSync
const updateAfter = 700

// A couple constants for CSS
const searchInputHeight = `2.25rem`
const searchMetaHeight = `3rem`
const searchInputWrapperMargin = space[6]

/* stylelint-disable */
const searchBoxStyles = t => css`
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
    appearance: none;
    -webkit-appearance: none;
    background: ${t.colors.themedInput.background};
    border-radius: ${t.radii[2]};
    border: 0;
    color: ${t.colors.text};
    display: inline-block;
    height: ${searchInputHeight};
    padding: 0;
    padding-right: ${searchInputHeight};
    padding-left: ${searchInputHeight};
    margin: 0 ${searchInputWrapperMargin};
    transition: box-shadow ${t.transition.speed.default}
      ${t.transition.curve.default};
    vertical-align: middle;
    white-space: normal;
    width: calc(100% - 2rem);

    :hover,
    :active,
    :focus {
      box-shadow: none;
      outline: 0;
    }

    :active,
    :focus {
      box-shadow: 0 0 0 2px ${t.colors.themedInput.focusBoxShadow};
      background: ${t.colors.themedInput.backgroundFocus};
    }

    ::placeholder {
      color: ${t.colors.themedInput.placeholder};
    }
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
    border-radius: ${t.radii[2]} 0 0 ${t.radii[2]};
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .ais-SearchBox-submit:focus {
    outline: 0;
  }
  .ais-SearchBox-submit:focus svg {
    fill: ${t.colors.lilac};
  }
  .ais-SearchBox-submit svg {
    width: ${t.space[4]};
    height: ${t.space[4]};
    fill: ${t.colors.themedInput.placeholder};
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
    fill: ${t.colors.gatsby};
  }
  .ais-SearchBox-reset svg {
    fill: ${t.colors.themedInput.placeholder};
    width: ${t.space[3]};
    height: ${t.space[3]};
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
    background-color: ${t.colors.gatsby};
    border: 0;
    border-radius: ${t.radii[1]};
    color: ${t.colors.white};
    cursor: pointer;
    width: calc(100% - (${space[6]} * 2));
    margin: ${t.space[6]};
    height: ${t.space[9]};
    outline: none;
    transition: ${t.transition.default};
    font-family: ${t.fonts.heading};
    font-weight: bold;
  }
  .ais-InfiniteHits-loadMore:hover,
  .ais-InfiniteHits-loadMore:focus {
    background-color: ${t.colors.gatsby};
    color: ${t.colors.white};
  }
  .ais-InfiniteHits-loadMore[disabled] {
    display: none;
  }
`
/* stylelint-enable */

// Search shows a list of "hits", and is a child of the PluginSearchBar component
class Search extends Component {
  render() {
    return (
      <div sx={{ pb: [11, null, null, 0] }}>
        <div
          sx={{
            borderBottomWidth: `1px`,
            borderBottomStyle: `solid`,
            borderColor: `ui.border`,
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
            sx={{
              alignItems: `center`,
              color: `textMuted`,
              display: `flex`,
              height: searchMetaHeight,
              px: 6,
              fontSize: 0,
            }}
          >
            <Stats
              translations={{
                stats: function(n, ms) {
                  return `${n} results`
                },
              }}
            />
            <SkipNavLink />
          </div>
        </div>

        <div>
          <div
            sx={{
              [mediaQueries.md]: {
                height: t =>
                  `calc(100vh - ${t.sizes.headerHeight} - ${t.sizes.bannerHeight} - ${searchInputHeight} - ${searchInputWrapperMargin} - ${searchMetaHeight})`,
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
          sx={{
            fontSize: 0,
            lineHeight: 0,
            height: 20,
            mt: 6,
            display: `none`,
          }}
        >
          <a
            href={`https://www.algolia.com/`}
            sx={{
              "&&": {
                background: `url(${AlgoliaLogo})`,
                border: `none`,
                fontWeight: `body`,
                backgroundRepeat: `no-repeat`,
                backgroundPosition: `50%`,
                backgroundSize: `100%`,
                overflow: `hidden`,
                textIndent: `-9000px`,
                padding: `0!important`,
                width: 110,
                height: `100%`,
                display: `block`,
                ml: `auto`,
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
      sx={{
        "&&": {
          bg: selected ? `sidebar.itemHoverBackground` : `background`,
          borderBottom: 0,
          display: `block`,
          fontWeight: `body`,
          position: `relative`,
          px: 6,
          py: 5,
          transition: `none`,
          zIndex: selected ? 1 : false,
          "&:hover": {
            bg: selected
              ? `sidebar.itemHoverBackground`
              : `sidebar.itemHoverBackground`,
          },
          "&:before": {
            bg: `ui.border`,
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
            bg: selected ? `gatsby` : false,
            bottom: 0,
            content: `''`,
            left: 0,
            position: `absolute`,
            top: 0,
            width: 4,
          },
        },
      }}
    >
      <div
        sx={{
          alignItems: `baseline`,
          display: `flex`,
          justifyContent: `space-between`,
          mb: 3,
        }}
      >
        <h2
          sx={{
            alignItems: `center`,
            color: selected ? `navigation.linkColor` : `text`,
            display: `flex`,
            fontFamily: `body`,
            fontSize: 1,
            fontWeight: `bold`,
            my: 0,
          }}
        >
          {hit.name}
        </h2>
        <div>
          <span sx={visuallyHidden}>
            {hit.downloadsLast30Days} monthly downloads
          </span>
        </div>
        <div
          aria-hidden
          sx={{
            alignItems: `center`,
            color: selected ? `lilac` : `textMuted`,
            display: `flex`,
            lineHeight: `solid`,
            fontSize: 0,
          }}
        >
          {hit.repository &&
            hit.name[0] !== `@` &&
            hit.repository.url.indexOf(`https://github.com/gatsbyjs/gatsby`) ===
              0 && (
              <span sx={{ mr: 1 }} alt={`Official Gatsby Plugin`}>
                <GatsbyIcon />
              </span>
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
        sx={{
          color: selected ? `inherit` : `textMuted`,
          fontSize: 1,
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
