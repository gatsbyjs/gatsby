import React, { Component } from "react"
import Helmet from "react-helmet"

import { Link } from "gatsby"
import Img from "gatsby-image"

import Layout from "../components/layout"
import SearchIcon from "../components/search-icon"
//import FuturaParagraph from "../components/futura-paragraph"
//import Container from "../components/container"
import { /* options, rhythm, */ scale } from "../utils/typography"
import { /*presets,*/ colors } from "../utils/presets"
import MdFilterList from "react-icons/lib/md/filter-list"
import FaAngleDown from "react-icons/lib/fa/angle-down"
import FaAngleUp from "react-icons/lib/fa/angle-up"

import Fuse from "fuse.js"
import FeaturedSitesIcon from "../assets/featured-sites-icons.svg"

// TODO: make sure to use colors

// TODO: make sure to run Prettier before PR

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
      node.categories.filter(c => categories.has(c)).length > 0
  )

  return items
}

// TODO: not final
const ShowcaseList = ({ items, count }) => {
  if (count) items = items.slice(0, count)

  return (
    <div css={{ display: `flex`, flexWrap: `wrap` }}>
      {items.map(
        ({ node }) =>
          node.fields && ( // have to filter out null fields from bad data
            <Link
              key={node.id}
              to={{ pathname: node.fields.slug, state: { isModal: true } }}
              css={{
                borderBottom: `none !important`,
                boxShadow: `none !important`,
              }}
            >
              <div css={{ margin: `12px` }}>
                {node.childScreenshot ? (
                  <Img
                    resolutions={
                      node.childScreenshot.screenshotFile.childImageSharp
                        .resolutions
                    }
                    alt={`Screenshot of ${node.title}`}
                  />
                ) : (
                  <div
                    css={{
                      width: 282,
                      height: 211,
                      backgroundColor: `#d999e7`,
                    }}
                  >
                    missing
                  </div>
                )}
                {node.title}
                <div
                  css={{
                    ...scale(-2 / 5),
                    color: `#9B9B9B`,
                    fontWeight: `normal`,
                  }}
                >
                  {node.categories && node.categories.join(`, `)}
                </div>
              </div>
            </Link>
          )
      )}
    </div>
  )
}

class Collapsible extends Component {
  state = {
    collapsed: false,
  }

  handleClick = () => {
    this.setState({ collapsed: !this.state.collapsed })
  }

  render() {
    const { heading, children } = this.props
    return (
      <div>
        {/* TODO: onClick should be on a link or something */}
        <h4 css={{ color: colors.lilac }} onClick={this.handleClick}>
          {heading} {this.state.collapsed ? <FaAngleDown /> : <FaAngleUp />}
        </h4>
        <div
          css={{
            overflow: `hidden`,
            height: this.state.collapsed ? `0px` : `500px`,
            transition: `height 0.2s`,
          }}
        >
          <div css={{ overflow: `scroll`, height: `500px` }}>{children}</div>
        </div>
      </div>
    )
  }
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

    let windowWidth
    if (typeof window !== `undefined`) {
      windowWidth = window.innerWidth
    }

    const isDesktop = windowWidth > 750

    let items = data.allSitesYaml.edges

    if (this.state.search.length > 0) {
      items = this.fuse.search(this.state.search)
    }

    if (filters.size > 0) {
      items = filterByCategories(items, filters)
    }

    return (
      <div css={{ display: `flex` }}>
        {isDesktop && (
          <div css={{ flexBasis: `18rem`, minWidth: `18rem` }}>
            <h3>
              Filter & Refine <MdFilterList />
            </h3>
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
                  <ul key={c}>
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
                        display: `flex`,
                        justifyContent: `space-between`,
                        width: `100%`,
                        border: `none`,
                        background: `none`,
                        cursor: `pointer`,
                        ":hover": {
                          color: colors.gatsby,
                          "& .rule": { visibility: `visible` },
                        },
                        "&.selected": {
                          color: colors.gatsby,
                          "& .rule": { visibility: `visible` },
                        },
                      }}
                    >
                      <div>{c}</div>
                      <div
                        className="rule"
                        css={{
                          visibility: `hidden`,
                          backgroundColor: colors.gatsby,
                          width: `100%`,
                          height: `1px`,
                          margin: `10px`,
                        }}
                      />
                      <div>{count}</div>
                    </button>
                  </ul>
                ))}
            </Collapsible>
          </div>
        )}
        <div>
          <div
            css={{
              display: `flex`,
              alignItems: `center`,
              flexDirection: isDesktop ? `row` : `column`,
            }}
          >
            <h2 css={{ flexGrow: 1 }} id="search-heading">
              {this.state.search.length === 0 ? (
                filters.size === 0 ? (
                  <span>
                    All {data.allSitesYaml.edges.length} (blazing fast) Showcase
                    Sites
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
            <div>
              <label css={{ position: `relative` }}>
                <input
                  css={{
                    paddingLeft: `1.4rem`,
                  }}
                  type="text"
                  value={this.state.search}
                  onChange={e =>
                    this.setState({
                      search: e.target.value,
                    })
                  }
                  placeholder="Search"
                />
                <SearchIcon
                  overrideCSS={{
                    // ...iconStyles,
                    // fill: focussed && colors.gatsby,
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
          <ShowcaseList items={items} count={this.state.sitesToShow} />
          {this.state.sitesToShow < items.length && (
            <button
              css={{
                backgroundColor: `#663399`,
                color: `white`,
                marginTop: 15,
                marginBottom: 60,
                width: !isDesktop && `100%`,
                padding: !isDesktop && `15px`,
              }}
              onClick={() => {
                this.setState({ sitesToShow: this.state.sitesToShow + 9 })
              }}
            >
              Load More
              <div css={{ marginLeft: `5px`, display: `inline` }}>↓</div>
            </button>
          )}
        </div>
      </div>
    )
  }
}

class ShowcasePage extends Component {
  state = {
    filters: new Set([]),
  }

  render() {
    const data = this.props.data
    const location = this.props.location

    let windowWidth
    if (typeof window !== `undefined`) {
      windowWidth = window.innerWidth
    }

    const isDesktop = windowWidth > 750
    return (
      <Layout location={location}>
        <div css={{ margin: `20px 30px` }}>
          <Helmet>
            <title>Showcase</title>
          </Helmet>
          <div
            css={{
              display: `flex`,
              alignItems: `center`,
              color: `#9D7CBF`,
              marginBottom: 30,
            }}
          >
            <img src={FeaturedSitesIcon} alt="icon" css={{ marginBottom: 0 }} />
            {isDesktop && (
              <>`               `<span
                  css={{
                    fontWeight: `bold`,
                    fontSize: 24,
                    marginRight: 30,
                    marginLeft: 15,
                  }}
                >
                  Featured Sites
                </span>`               `<div>View all</div>`               `<div css={{ marginLeft: `5px` }}>→</div>`               `<div css={{ flex: 1 }}>{``}</div>`             `</>
            )}
            <div css={{ marginRight: 15 }}>Want to get featured?</div>
            {/* TODO: maybe have a site submission issue template */}
            <a
              href="https://github.com/gatsbyjs/gatsby/issues/new?template=feature_request.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                css={{
                  backgroundColor: `#663399`,
                  color: `white`,
                  padding: `5px 10px`,
                  fontWeight: `normal`,
                }}
              >
                Submit your Site
                <div css={{ marginLeft: `5px`, display: `inline` }}>→</div>
              </div>
            </a>
          </div>
          {isDesktop && (
            <div css={{ position: `relative` }}>
              <div
                css={{
                  display: `flex`,
                  overflow: `scroll`,
                  position: `relative`,
                }}
              >
                {data.featured.edges.slice(0, 9).map(({ node }) => (
                  <Link
                    key={node.id}
                    css={{
                      display: `block`,
                      marginRight: `30px`,
                      borderBottom: `none !important`,
                      boxShadow: `none !important`,
                    }}
                    to={{
                      pathname: node.fields.slug,
                      state: { isModal: true },
                    }}
                  >
                    {node.childScreenshot && (
                      <Img
                        resolutions={
                          node.childScreenshot.screenshotFile.childImageSharp
                            .resolutions
                        }
                        alt={node.title}
                      />
                    )}
                    {node.title}
                    <div>{node.categories && node.categories.join(`, `)}</div>
                    {node.built_by && <div>Built by {node.built_by}</div>}
                  </Link>
                ))}
                <div css={{ margin: `15px` }}>
                  <a
                    href="#search-heading"
                    css={{
                      display: `block`,
                      width: `512px`,
                      height: `288px`,
                      textAlign: `center`,
                      padding: 0,
                      background: `none`,
                      border: `none`,
                      cursor: `pointer`,
                    }}
                    onClick={() =>
                      this.setState({ filters: new Set([`Featured`]) })
                    }
                  >
                    See More Featured Sites
                  </a>
                </div>
              </div>
              <div
                css={{
                  position: `absolute`,
                  top: `0`,
                  bottom: `0`,
                  right: `0`,
                  width: `60px`,
                  background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,255,255,1) 100%)`,
                }}
              />
            </div>
          )}
          <FilteredShowcase
            data={data}
            filters={this.state.filters}
            setFilters={filters => this.setState({ filters })}
          />
        </div>
      </Layout>
    )
  }
}

export default ShowcasePage

export const showcaseQuery = graphql`
  query ShowcaseQuery {
    featured: allSitesYaml(filter: { featured: { eq: true } }) {
      edges {
        node {
          id
          title
          categories
          built_by

          fields {
            slug
          }

          childScreenshot {
            screenshotFile {
              childImageSharp {
                resolutions(width: 512, height: 288) {
                  ...GatsbyImageSharpResolutions
                }
              }
            }
          }
        }
      }
    }
    allSitesYaml(filter: { main_url: { ne: null } }) {
      edges {
        node {
          id
          featured

          title
          categories
          built_by
          description

          main_url
          built_by_url

          childScreenshot {
            screenshotFile {
              childImageSharp {
                resolutions(width: 282, height: 211) {
                  ...GatsbyImageSharpResolutions
                }
              }
            }
          }
          fields {
            slug
          }
        }
      }
    }
  }
`
