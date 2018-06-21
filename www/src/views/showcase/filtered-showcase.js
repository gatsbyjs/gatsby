import React, { Component } from "react"
import MdClear from "react-icons/lib/md/clear"
import MdCheckboxBlank from "react-icons/lib/md/check-box-outline-blank"
import MdCheckbox from "react-icons/lib/md/check-box"
import MdArrowDownward from "react-icons/lib/md/arrow-downward"
import MdFilterList from "react-icons/lib/md/filter-list"
import Fuse from "fuse.js"
import hex2rgba from "hex2rgba"
import { style } from "glamor"

import ShowcaseList from "./showcase-list"
import Collapsible from "./collabsible"
import SearchIcon from "../../components/search-icon"
import { options, scale, rhythm } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

const count = arrays => {
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

const filterByCategories = (list, categories) => {
  let items = list

  items = items.filter(
    ({ node }) =>
      node.categories &&
      node.categories.filter(c => categories.has(c)).length === categories.size
  )

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
    const { data, filters } = this.props

    let items = data.allSitesYaml.edges

    if (this.state.search.length > 0) {
      items = this.fuse.search(this.state.search)
    }

    if (filters.size > 0) {
      items = filterByCategories(items, filters)
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
              // background: colors.ui.whisper,
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
            }}
          >
            {filters.size > 0 && (
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
                  onClick={() => {
                    this.props.setFilters([])
                  }}
                >
                  <MdClear style={{ marginRight: rhythm(1 / 4) }} /> Reset all
                  Filters
                </button>
              </div>
            )}
            <Collapsible heading="Category">
              {Array.from(
                count(
                  data.allSitesYaml.edges.map(({ node }) => node.categories)
                )
              )
                .sort(([a], [b]) => {
                  if (a < b) return -1
                  if (a > b) return 1
                  return 0
                })
                .map(([c, count]) => (
                  <ul key={c} css={{ margin: 0 }}>
                    <button
                      className={filters.has(c) ? `selected` : ``}
                      onClick={() => {
                        if (filters.has(c)) {
                          filters.delete(c)
                          this.props.setFilters(filters)
                        } else {
                          this.props.setFilters(filters.add(c))
                        }
                      }}
                      css={{
                        ...scale(-1 / 6),
                        alignItems: `flex-start`,
                        background: `none`,
                        border: `none`,
                        color: colors.gray.text,
                        cursor: `pointer`,
                        display: `flex`,
                        fontFamily: options.headerFontFamily.join(`,`),
                        justifyContent: `space-between`,
                        outline: `none`,
                        padding: 0,
                        paddingRight: rhythm(1),
                        paddingBottom: rhythm(options.blockMarginBottom / 8),
                        paddingTop: rhythm(options.blockMarginBottom / 8),
                        width: `100%`,
                        textAlign: `left`,
                        ":hover": {
                          color: colors.gatsby,
                        },
                      }}
                    >
                      <div
                        css={{
                          color: filters.has(c)
                            ? colors.gatsby
                            : colors.ui.bright,
                          ...scale(0),
                          marginRight: 8,
                        }}
                      >
                        {filters.has(c) ? <MdCheckbox /> : <MdCheckboxBlank />}
                      </div>
                      <div
                        css={{
                          color: filters.has(c) ? colors.gatsby : false,
                          marginRight: `auto`,
                        }}
                      >
                        {c}
                      </div>
                      <div css={{ color: colors.gray.calm }}>{count}</div>
                    </button>
                  </ul>
                ))}
            </Collapsible>
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
              {this.state.search.length === 0 ? (
                filters.size === 0 ? (
                  <span>
                    All {data.allSitesYaml.edges.length} Showcase Sites
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

export default FilteredShowcase

const styles = {
  featuredSitesCard: style({
    display: `flex`,
    flexDirection: `column`,
    flexGrow: 0,
    flexShrink: 0,
    width: 320,
    marginBottom: rhythm(options.blockMarginBottom * 2),
    marginRight: rhythm(3 / 4),
    [presets.Hd]: {
      width: 360,
      marginRight: rhythm(6 / 4),
    },
    [presets.VHd]: {
      width: 400,
    },
  }),
  withTitleHover: style({
    "& .title": {
      transition: `box-shadow .3s cubic-bezier(.4,0,.2,1), transform .3s cubic-bezier(.4,0,.2,1)`,
      boxShadow: `inset 0 0px 0px 0px ${colors.ui.whisper}`,
    },
    "&:hover .title": {
      boxShadow: `inset 0 -3px 0px 0px ${colors.ui.bright}`,
    },
  }),
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
      top: `calc(${presets.headerHeight} - 1px)`,
    },
  },
  scrollbar: {
    WebkitOverflowScrolling: `touch`,
    "&::-webkit-scrollbar": {
      width: `6px`,
      height: `6px`,
    },
    "&::-webkit-scrollbar-thumb": {
      background: colors.ui.bright,
    },
    "&::-webkit-scrollbar-track": {
      background: colors.ui.light,
    },
  },
  screenshot: {
    borderRadius: presets.radius,
    boxShadow: `0 4px 10px ${hex2rgba(colors.gatsby, 0.1)}`,
    marginBottom: rhythm(options.blockMarginBottom / 2),
    transition: `all ${presets.animation.speedDefault} ${
      presets.animation.curveDefault
    }`,
  },
  screenshotHover: {
    background: `transparent`,
    color: colors.gatsby,
    "& .gatsby-image-wrapper": {
      transform: `translateY(-3px)`,
      boxShadow: `0 8px 20px ${hex2rgba(colors.lilac, 0.5)}`,
    },
  },
}
