/* @jsx jsx */
import { jsx } from "theme-ui"
import { Component } from "react"
import { Link } from "gatsby"
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
import removeMD from "remove-markdown"
import { debounce, unescape } from "lodash-es"

const searchInputHeight = `2.25rem`
const searchMetaHeight = `3rem`
const searchInputWrapperMargin = 6
const updateAfter = 700

// the result component is fed into the InfiniteHits component
const Result = ({ hit, pathname, query }) => {
  // Example:
  // pathname = `/packages/gatsby-link/` || `/packages/@comsoc/gatsby-mdast-copy-linked-files`
  //  hit.name = `gatsby-link` || `@comsoc/gatsby-mdast-copy-linked-files`
  const selected = new RegExp(`^/packages/${hit.name}/?$`).test(pathname)
  const isOfficial = /* isOfficialPackage(hit) */ false
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
            // [mediaQueries.md]: {
            //   display: `none`,
            // },
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
        {/* <div>
          <span sx={visuallyHidden}>
            {hit.downloadsLast30Days} monthly downloads
          </span>
        </div> */}
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
          {/* <span
            sx={{ mr: 1 }}
            alt={
              isOfficial ? `Official Gatsby Plugin` : `Community Gatsby Plugin`
            }
          >
            {isOfficial ? <GatsbyIcon /> : <CommunityIcon />}
          </span> */}
          <span
            css={{
              width: `5em`,
              textAlign: `right`,
            }}
          >
            {hit.humanDownloadsLast30Days}
            {` `}
            {/* <ArrowDownwardIcon /> */}
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

function Search({ pathname, query }) {
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
        {/* <Global styles={searchBoxStyles} /> */}
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
              stats: function (n) {
                return `${n} results`
              },
            }}
          />
          {/* <SkipNavLink /> */}
        </div>
      </div>

      <div>
        <div
          sx={
            {
              // [mediaQueries.md]: {
              //   height: t =>
              //     `calc(100vh - ${t.sizes.headerHeight} - ${t.sizes.bannerHeight} - ${searchInputHeight} - ${searchInputWrapperMargin} - ${searchMetaHeight})`,
              //   overflowY: `scroll`,
              // },
            }
          }
        >
          <InfiniteHits
            hitComponent={result => (
              <Result hit={result.hit} pathname={pathname} query={query} />
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
              // background: `url(${AlgoliaLogo})`,
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
                // background: `url(${AlgoliaLogo})`,
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
