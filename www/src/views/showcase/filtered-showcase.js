import React, { Component } from "react"
import MdArrowDownward from "react-icons/lib/md/arrow-downward"
import Fuse from "fuse.js"

import Filters from "./filters"
import ShowcaseList from "./showcase-list"
import SearchIcon from "../../components/search-icon"
import { options, rhythm, scale } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"
import URLQuery from "../../components/url-query"

const filterByCategories = (list, categories) => {
  const items = list.reduce((aggregated, edge) => {
    if (edge.node.categories) {
      if (edge.node.categories.filter(c => categories.includes(c)).length) {
        aggregated.push(edge)
      }

      return aggregated
    }

    return aggregated
  }, [])

  return items
}

class FilteredShowcase extends Component {
  state = {
    search: ``,
    sitesToShow: 9,
  }

  constructor(props) {
    super(props)

    const options = {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        `node.title`,
        `node.categories`,
        `node.built_by`,
        `node.description`,
      ],
    }

    this.fuse = new Fuse(props.data.allSitesYaml.edges, options)
  }

  render() {
    const { data } = this.props

    return (
      <URLQuery>
        {({ filters = [] }, updateQuery) => {
          let items = data.allSitesYaml.edges

          if (this.state.search.length > 0) {
            items = this.fuse.search(this.state.search)
          }

          if (filters && filters.length > 0) {
            items = filterByCategories(items, filters)
          }

          // create map of categories with totals
          const aggregatedCategories = data.allSitesYaml.edges.reduce(
            (categories, edge) => {
              if (edge.node.categories) {
                edge.node.categories.forEach(category => {
                  // if we already have the category recorded, increase count
                  if (categories[category]) {
                    categories[category] = categories[category] + 1
                  } else {
                    // record first encounter of category
                    categories[category] = 1
                  }
                })
              }

              return { ...categories }
            },
            {}
          )

          // get sorted set of categories to generate list with
          const categoryKeys = Object.keys(aggregatedCategories).sort(
            (a, b) => {
              if (a < b) return -1
              if (a > b) return 1
              return 0
            }
          )

          return (
            <section className="showcase" css={{ display: `flex` }}>
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
                    // background: colors.ui.whisper,
                    height: `calc(100vh - (${presets.headerHeight} + ${
                      presets.bannerHeight
                    }))`,
                  },
                }}
              >
                <Filters
                  updateQuery={updateQuery}
                  filters={filters}
                  categoryKeys={categoryKeys}
                  aggregatedCategories={aggregatedCategories}
                />
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
                    {this.state.search.length === 0 ? (
                      filters.length === 0 ? (
                        <span>
                          All {data.allSitesYaml.edges.length} Showcase Sites
                        </span>
                      ) : (
                        <span>
                          {items.length}
                          {` `}
                          {filters.length === 1 && filters.values()[0]}
                          {` `}
                          Sites
                        </span>
                      )
                    ) : (
                      <span>{items.length} search results</span>
                    )}
                  </h2>
                  <div css={{ marginLeft: `auto` }}>
                    <label css={{ position: `relative` }}>
                      <input
                        css={{ ...styles.searchInput }}
                        type="text"
                        value={this.state.search}
                        onChange={e =>
                          this.setState({
                            search: e.target.value,
                          })
                        }
                        placeholder="Search sites"
                        aria-label="Search sites"
                      />
                      <SearchIcon
                        overrideCSS={{
                          fill: colors.lilac,
                          position: `absolute`,
                          left: `5px`,
                          top: `50%`,
                          width: `16px`,
                          height: `16px`,
                          pointerEvents: `none`,
                          transform: `translateY(-50%)`,
                        }}
                      />
                    </label>
                  </div>
                </div>

                <ShowcaseList items={items} count={this.state.sitesToShow} />

                {this.state.sitesToShow < items.length && (
                  <button
                    css={{
                      ...styles.button,
                      ...styles.loadMoreButton,
                    }}
                    onClick={() => {
                      this.setState({
                        sitesToShow: this.state.sitesToShow + 15,
                      })
                    }}
                  >
                    Load More
                    <MdArrowDownward style={{ marginLeft: 4 }} />
                  </button>
                )}
              </div>
            </section>
          )
        }}
      </URLQuery>
    )
  }
}

export default FilteredShowcase

const styles = {
  button: {
    border: 0,
    borderRadius: presets.radius,
    cursor: `pointer`,
    fontFamily: options.headerFontFamily.join(`,`),
    fontWeight: `bold`,
    padding: `${rhythm(1 / 5)} ${rhythm(2 / 3)}`,
    WebkitFontSmoothing: `antialiased`,
    "&&": {
      backgroundColor: colors.gatsby,
      borderBottom: `none`,
      boxShadow: `none`,
      color: `white`,
      "&:hover": {
        backgroundColor: colors.gatsby,
      },
    },
  },
  sticky: {
    paddingTop: rhythm(options.blockMarginBottom),
    position: `sticky`,
    top: 0,
    [presets.Desktop]: {
      top: `calc(${presets.headerHeight} + ${presets.bannerHeight} - 1px)`,
    },
  },
  searchInput: {
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
  },
  loadMoreButton: {
    display: `block`,
    marginBottom: rhythm(options.blockMarginBottom * 5),
    marginTop: rhythm(options.blockMarginBottom * 2),
    marginLeft: `auto`,
    marginRight: `auto`,
    [presets.Desktop]: {
      marginLeft: rhythm(6 / 4),
      marginRight: rhythm(6 / 4),
    },
  },
}
