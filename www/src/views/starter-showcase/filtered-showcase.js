import React, { Component } from "react"
import SearchIcon from "../../components/search-icon"
import MdFilterList from "react-icons/lib/md/filter-list"
import MdClear from "react-icons/lib/md/clear"
import MdArrowDownward from "react-icons/lib/md/arrow-downward"
import MdArrowForward from "react-icons/lib/md/arrow-forward"
import MdSort from "react-icons/lib/md/sort"

import { options, /* rhythm, */ scale, rhythm } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

import styles from "../shared/styles"

import LHSFilter from "./lhs-filter"
import ShowcaseList from "./showcase-list"

export default class FilteredShowcase extends Component {
  state = {
    sitesToShow: 9,
  }
  setFiltersCategory = filtersCategory =>
    this.props.setURLState({ c: Array.from(filtersCategory) })
  setFiltersDependency = filtersDependency =>
    this.props.setURLState({ d: Array.from(filtersDependency) })
  toggleSort = () =>
    this.props.setURLState({
      sort: this.props.urlState.sort === `recent` ? `stars` : `recent`,
    })
  resetFilters = () => this.props.setURLState({ c: null, d: null, s: `` })
  render() {
    const { data, urlState, setURLState } = this.props
    const {
      setFiltersCategory,
      setFiltersDependency,
      resetFilters,
      toggleSort,
    } = this
    const filtersCategory = new Set(
      Array.isArray(urlState.c) ? urlState.c : [urlState.c]
    )
    const filtersDependency = new Set(
      Array.isArray(urlState.d) ? urlState.d : [urlState.d]
    )
    // https://stackoverflow.com/a/32001444/1106414
    const filters = new Set(
      [].concat(
        ...[filtersCategory, filtersDependency].map(set => Array.from(set))
      )
    )

    let items = data.allMarkdownRemark.edges,
      imgs = data.allFile.edges

    if (urlState.s.length > 0) {
      items = items.filter(node => {
        // TODO: SWYX: very very simple object search algorithm, i know, sorry
        const { fields, frontmatter } = node.node
        if (fields) frontmatter.fields = fields.starterShowcase
        return JSON.stringify(frontmatter)
          .toLowerCase()
          .includes(urlState.s)
      })
    }

    if (filtersCategory.size > 0) {
      items = filterByCategories(items, filtersCategory)
    }
    if (filtersDependency.size > 0) {
      items = filterByDependencies(items, filtersDependency)
    }

    return (
      <section
        className="showcase"
        css={{
          display: `flex`,
        }}
      >
        <div
          css={{
            display: `none`,
            [presets.Desktop]: {
              display: `block`,
              flexBasis: `15rem`,
              minWidth: `15rem`,
              ...styles.sticky,
              paddingTop: 0,
              borderRight: `1px solid ${colors.ui.light}`,
              height: `calc(100vh - ${presets.headerHeight})`,
            },
          }}
        >
          <h3
            css={{
              margin: 0,
              [presets.Desktop]: {
                ...scale(1 / 8),
                lineHeight: 1,
                height: presets.headerHeight,
                margin: 0,
                color: colors.gray.calm,
                fontWeight: `normal`,
                display: `flex`,
                flexShrink: 0,
                paddingLeft: rhythm(3 / 4),
                paddingRight: rhythm(3 / 4),
                paddingTop: rhythm(options.blockMarginBottom),
                paddingBottom: rhythm(options.blockMarginBottom),
                borderBottom: `1px solid ${colors.ui.light}`,
              },
            }}
          >
            Filter & Refine{` `}
            <span css={{ marginLeft: `auto`, opacity: 0.5 }}>
              <MdFilterList />
            </span>
          </h3>
          <div
            css={{
              paddingLeft: rhythm(3 / 4),
              height: `calc(100vh - ((${presets.headerHeight} * 2) + ${
                presets.bannerHeight
              }))`,
              display: `flex`,
              flexDirection: `column`,
            }}
          >
            {(filters.size > 0 || urlState.s.length > 0) && ( // search is a filter too https://gatsbyjs.slack.com/archives/CB4V648ET/p1529224551000008
              <div
                css={{
                  marginRight: rhythm(3 / 4),
                }}
              >
                <button
                  css={{
                    ...scale(-1 / 6),
                    alignItems: `center`,
                    background: colors.ui.light,
                    border: 0,
                    borderRadius: presets.radius,
                    color: colors.gatsby,
                    cursor: `pointer`,
                    display: `flex`,
                    fontFamily: options.headerFontFamily.join(`,`),
                    marginTop: rhythm(options.blockMarginBottom),
                    paddingRight: rhythm(3 / 4),
                    textAlign: `left`,
                    "&:hover": {
                      background: colors.gatsby,
                      color: `#fff`,
                    },
                  }}
                  onClick={resetFilters}
                >
                  <MdClear style={{ marginRight: rhythm(1 / 4) }} /> Reset all
                  Filters
                </button>
              </div>
            )}
            <LHSFilter
              heading="Categories"
              data={Array.from(
                count(
                  items.map(
                    ({ node }) => node.frontmatter && node.frontmatter.tags
                  )
                )
              )}
              filters={filtersCategory}
              setFilters={setFiltersCategory}
              sortRecent={urlState.sort === `recent`}
            />
            <LHSFilter
              heading="Gatsby Dependencies"
              data={Array.from(
                count(
                  items.map(
                    ({ node }) =>
                      node.fields &&
                      node.fields.starterShowcase.gatsbyDependencies.map(
                        str => str[0]
                      )
                  )
                )
              )}
              filters={filtersDependency}
              setFilters={setFiltersDependency}
              sortRecent={urlState.sort === `recent`}
            />
          </div>
        </div>
        <div css={{ width: `100%` }}>
          <div
            css={{
              display: `flex`,
              alignItems: `center`,
              height: presets.headerHeight,
              flexDirection: `row`,
              ...styles.sticky,
              background: `rgba(255,255,255,0.98)`,
              paddingLeft: `${rhythm(3 / 4)}`,
              paddingRight: `${rhythm(3 / 4)}`,
              paddingBottom: rhythm(options.blockMarginBottom),
              zIndex: 1,
              borderBottom: `1px solid ${colors.ui.light}`,
            }}
          >
            <h2
              css={{
                color: colors.gatsby,
                margin: 0,
                ...scale(1 / 5),
                lineHeight: 1,
              }}
            >
              {urlState.s.length === 0 ? (
                filters.size === 0 ? (
                  <span>
                    All {data.allMarkdownRemark.edges.length} Starters
                  </span>
                ) : (
                  <span>
                    {items.length}
                    {` `}
                    {filters.size === 1 && filters.values()[0]}
                    {` `}
                    Sites
                  </span>
                )
              ) : (
                <span>{items.length} search results</span>
              )}
            </h2>
            <div css={{ marginLeft: `auto` }}>
              <label
                css={{
                  display: `none`,
                  [presets.Desktop]: {
                    color: colors.gatsby,
                    border: 0,
                    borderRadius: presets.radiusLg,
                    fontFamily: options.headerFontFamily.join(`,`),
                    paddingTop: rhythm(1 / 8),
                    paddingRight: rhythm(1 / 5),
                    paddingBottom: rhythm(1 / 8),
                    paddingLeft: rhythm(1),
                    width: rhythm(5),
                  },
                }}
              >
                <MdArrowForward css={{ marginRight: 8 }} />
                Submit your starter
              </label>
              <label
                css={{
                  display: `none`,
                  [presets.Desktop]: {
                    color: colors.gatsby,
                    border: 0,
                    borderRadius: presets.radiusLg,
                    fontFamily: options.headerFontFamily.join(`,`),
                    paddingTop: rhythm(1 / 8),
                    paddingRight: rhythm(1 / 5),
                    paddingBottom: rhythm(1 / 8),
                    // paddingLeft: rhythm(1),
                    width: rhythm(5),
                  },
                }}
                onClick={toggleSort}
              >
                <MdSort css={{ marginRight: 8 }} />
                {urlState.sort === `recent` ? `Most recent` : `Most stars`}
              </label>
              <label css={{ position: `relative` }}>
                <input
                  css={{
                    border: 0,
                    borderRadius: presets.radiusLg,
                    color: colors.gatsby,
                    fontFamily: options.headerFontFamily.join(`,`),
                    paddingTop: rhythm(1 / 8),
                    paddingRight: rhythm(1 / 5),
                    paddingBottom: rhythm(1 / 8),
                    paddingLeft: rhythm(1),
                    width: rhythm(5),
                    ":focus": {
                      outline: 0,
                      backgroundColor: colors.ui.light,
                      borderRadius: presets.radiusLg,
                      transition: `width ${presets.animation.speedDefault} ${
                        presets.animation.curveDefault
                      }, background-color ${presets.animation.speedDefault} ${
                        presets.animation.curveDefault
                      }`,
                    },
                  }}
                  type="text"
                  value={urlState.s}
                  // TODO: SWYX: i know this is spammy, we can finetune history vs search later
                  onChange={e => setURLState({ s: e.target.value })}
                  placeholder="Search sites"
                  aria-label="Search sites"
                />
                <SearchIcon
                  overrideCSS={{
                    // ...iconStyles,
                    fill: colors.lilac,
                    position: `absolute`,
                    left: `5px`,
                    top: `50%`,
                    width: `16px`,
                    height: `16px`,
                    pointerEvents: `none`,
                    // transition: `fill ${speedDefault} ${curveDefault}`,
                    transform: `translateY(-50%)`,

                    // [presets.Hd]: {
                    //   fill: focussed && isHomepage && colors.gatsby,
                    // },
                  }}
                />
              </label>
            </div>
          </div>
          <ShowcaseList
            urlState={urlState}
            sortRecent={urlState.sort === `recent`}
            items={items}
            imgs={imgs}
            count={this.state.sitesToShow}
          />
          {this.state.sitesToShow < items.length && (
            <button
              css={{
                ...styles.button,
                display: `block`,
                marginBottom: rhythm(options.blockMarginBottom * 5),
                marginTop: rhythm(options.blockMarginBottom * 2),
                marginLeft: `auto`,
                marginRight: `auto`,
                [presets.Desktop]: {
                  marginLeft: rhythm(6 / 4),
                  marginRight: rhythm(6 / 4),
                },
              }}
              onClick={() => {
                this.setState({ sitesToShow: this.state.sitesToShow + 15 })
              }}
            >
              Load More
              <MdArrowDownward style={{ marginLeft: 4 }} />
            </button>
          )}
        </div>
      </section>
    )
  }
}

// utility functions

function count(arrays) {
  let counts = new Map()

  for (let categories of arrays) {
    if (!categories) continue

    for (let category of categories) {
      if (!counts.has(category)) {
        counts.set(category, 0)
      }

      counts.set(category, counts.get(category) + 1)
    }
  }

  return counts
}

function filterByCategories(list, categories) {
  let items = list
  items = items.filter(
    ({ node }) =>
      node.frontmatter && isSuperset(node.frontmatter.tags, categories)
  )
  return items
}
function filterByDependencies(list, categories) {
  let items = list

  items = items.filter(
    ({ node }) =>
      node.fields &&
      isSuperset(
        node.fields.starterShowcase.gatsbyDependencies.map(c => c[0]),
        categories
      )
    // node.fields.starterShowcase.gatsbyDependencies.filter(c => categories.has(c[0])).length > 0
  )

  return items
}

function isSuperset(set, subset) {
  for (var elem of subset) {
    if (!set.includes(elem)) {
      return false
    }
  }
  return true
}
