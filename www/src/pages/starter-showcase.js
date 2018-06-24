import React, { Component } from "react"
import Helmet from "react-helmet"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import Layout from "../components/layout"
import SearchIcon from "../components/search-icon"
import MdFilterList from "react-icons/lib/md/filter-list"
import FaAngleDown from "react-icons/lib/fa/angle-down"
import FaAngleUp from "react-icons/lib/fa/angle-up"
import FaExtLink from "react-icons/lib/fa/external-link"
import FaGithub from "react-icons/lib/fa/github"
import FaClipboard from "react-icons/lib/fa/clipboard"
import MdClear from "react-icons/lib/md/clear"
import MdCheckboxBlank from "react-icons/lib/md/check-box-outline-blank"
import MdCheckbox from "react-icons/lib/md/check-box"
import MdArrowDownward from "react-icons/lib/md/arrow-downward"
import MdArrowForward from "react-icons/lib/md/arrow-forward"
import MdSort from "react-icons/lib/md/sort"
// import FeaturedSitesIcon from "../assets/featured-sites-icons.svg"
import { options, /* rhythm, */ scale, rhythm } from "../utils/typography"
import presets, { colors } from "../utils/presets"
import { style } from "glamor"
import hex2rgba from "hex2rgba"
import RRSM from '../utils/react-router-state-manager'

// main components

class StarterShowcasePage extends Component {

  shouldComponentUpdate(nextProps) {
    // prevent double render https://gatsbyjs.slack.com/archives/CA1GW1HNU/p1529615449000350
    return JSON.stringify(this.props) !== JSON.stringify(nextProps);
  }
  render() {
    const { data, location, urlState, setURLState } = this.props
    const filtersApplied = urlState.s !== '' ? urlState.s : ( // if theres a search term
      urlState.d && !Array.isArray(urlState.d) ? urlState.d : // if theres a single dependency
        'Showcase' // if no search term or single dependency
    )
    return (
      <Layout location={location}>
        <Helmet>
          <title>Starter Showcase</title>
          <meta name="description" content={`Gatsby Starters: ${filtersApplied}`} />
          <meta name="og:description" content={`Gatsby Starters: ${filtersApplied}`} />
          <meta name="twitter:description" content={`Gatsby Starters: ${filtersApplied}`} />
          <meta name="og:title" content={filtersApplied} />
          <meta name="og:type" content="article" />
          <meta name="twitter.label1" content="Reading time" />
          <meta name="twitter:data1" content={`1 min read`} />
        </Helmet>
        <FilteredShowcase data={data} urlState={urlState} setURLState={setURLState} />
      </Layout>
    )
  }
}

export default RRSM({ s: '', c: [], d: [], sort: 'recent' })(StarterShowcasePage)

export const showcaseQuery = graphql`
query SiteShowcaseQuery {
  allFile(
    filter: { absolutePath:{ regex: "/generatedScreenshots/" }
  }) {
    edges {
      node {
        name
        childImageSharp {
          fluid(maxWidth: 280, maxHeight: 230) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  }
  allMarkdownRemark(sort: {order: DESC, fields: [frontmatter___date]}, limit: 1000, filter: {fileAbsolutePath: {
    regex: "/startersData/", ne: null
  }}) {
    edges {
      node {
        id
        fileAbsolutePath
        frontmatter {
          demo
          repo
          tags
          features
        }
        fields {
          anchor
          slug
          title
          package
          starterShowcase {
            stub
            gatsbyDependencies
            lastUpdated
            description
            githubFullName
            owner {
              avatar_url
            }
            githubData {
              repoMetadata {
                full_name
                pushed_at
                name
                owner {
                  login
                }
              }
            }
            stars
          }
        }
      }
    }
  }
}
`

// smaller components

class FilteredShowcase extends Component {
  state = {
    sitesToShow: 9,
  }
  setFiltersCategory = filtersCategory => this.props.setURLState({ c: Array.from(filtersCategory) })
  setFiltersDependency = filtersDependency => this.props.setURLState({ d: Array.from(filtersDependency) })
  toggleSort = () => this.props.setURLState({ sort: this.props.urlState.sort === 'recent' ? 'stars' : 'recent' })
  resetFilters = () => this.props.setURLState({ c: null, d: null, s: '' })
  render() {
    const { data, urlState, setURLState } = this.props
    const { setFiltersCategory, setFiltersDependency, resetFilters, toggleSort } = this
    const filtersCategory = new Set(Array.isArray(urlState.c) ? urlState.c : [urlState.c])
    const filtersDependency = new Set(Array.isArray(urlState.d) ? urlState.d : [urlState.d])
    // https://stackoverflow.com/a/32001444/1106414
    const filters = new Set([].concat(...[filtersCategory, filtersDependency].map(set => Array.from(set))))

    let items = data.allMarkdownRemark.edges,
      imgs = data.allFile.edges

    if (urlState.s.length > 0) {
      items = items.filter(node => {
        // TODO: SWYX: very very simple object search algorithm, i know, sorry
        const { fields, frontmatter } = node.node
        if (fields) frontmatter.fields = fields.starterShowcase
        return JSON.stringify(frontmatter).toLowerCase().includes(urlState.s)
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
            }}
          >
            {(filters.size > 0 ||
              urlState.s.length > 0) && // search is a filter too https://gatsbyjs.slack.com/archives/CB4V648ET/p1529224551000008
              (
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
            <LHSFilter heading="Categories" data={Array.from(
              count(items.map(({ node }) => node.frontmatter && node.frontmatter.tags))
            )} filters={filtersCategory} setFilters={setFiltersCategory} sortRecent={urlState.sort === 'recent'} />
            <LHSFilter heading="Gatsby Dependencies" data={Array.from(
              count(items.map(({ node }) => node.fields && node.fields.starterShowcase.gatsbyDependencies.map(str => str[0])))
            )} filters={filtersDependency} setFilters={setFiltersDependency} sortRecent={urlState.sort === 'recent'} />
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
                    {data.allMarkdownRemark.edges.length} Starters for your new website
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
              <label css={{
                color: colors.gatsby,
                border: 0,
                borderRadius: presets.radiusLg,
                fontFamily: options.headerFontFamily.join(`,`),
                paddingTop: rhythm(1 / 8),
                paddingRight: rhythm(1 / 5),
                paddingBottom: rhythm(1 / 8),
                paddingLeft: rhythm(1),
                width: rhythm(5),
              }}>
                <MdArrowForward css={{ marginRight: 8 }} />
                Submit your starter
              </label>
              <label css={{
                color: colors.gatsby,
                border: 0,
                borderRadius: presets.radiusLg,
                fontFamily: options.headerFontFamily.join(`,`),
                paddingTop: rhythm(1 / 8),
                paddingRight: rhythm(1 / 5),
                paddingBottom: rhythm(1 / 8),
                // paddingLeft: rhythm(1),
                width: rhythm(5),
              }}
                onClick={toggleSort}
              >
                <MdSort css={{ marginRight: 8 }} />
                {urlState.sort === 'recent' ? 'Most recent' : 'Most stars'}
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
          <ShowcaseList urlState={urlState} sortRecent={urlState.sort === 'recent'} items={items} imgs={imgs} count={this.state.sitesToShow} />
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

function LHSFilter({ sortRecent, heading, data, filters, setFilters }) {
  return (
    <Collapsible heading={heading}>
      {data
        .sort(([a, anum], [b, bnum]) => {
          if (sortRecent) {
            if (a < b) return -1
            if (a > b) return 1
            return 0
          } else {
            return bnum - anum
          }
        })
        .map(([c, count]) => (
          <ul key={c} css={{ margin: 0 }}>
            <button
              className={filters.has(c) ? `selected` : ``}
              onClick={() => {
                if (filters.has(c)) {
                  filters.delete(c)
                  setFilters(filters)
                } else {
                  setFilters(filters.add(c))
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
                {c.replace(/^gatsby-/, '*-')}
              </div>
              <div css={{ color: colors.gray.calm }}>{count}</div>
            </button>
          </ul>
        ))}
    </Collapsible>
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
            height: this.state.collapsed ? `0px` : `250px`,
            transition: `height 0.2s`,
          }}
        >
          <div css={{ overflow: `scroll`, height: `250px` }}>{children}</div>
        </div>
      </div>
    )
  }
}

const ShowcaseList = ({ urlState, items, imgs, count, sortRecent }) => {
  if (!items.length) { // empty state!
    const emptyStateReason = urlState.s !== '' ? urlState.s : ( // if theres a search term
      urlState.d && !Array.isArray(urlState.d) ? urlState.d : // if theres a single dependency
        'matching' // if no search term or single dependency
    )
    return (
      <div css={{
        display: 'grid',
        height: '80%',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <h1>
          No {`${emptyStateReason}`} starters found!
          <div css={{ color: colors.gatsby }}>
            <small>Maybe you should write one and <a href="https://github.com/gatsbyjs/gatsby/issues/new?template=feature_request.md">submit it</a>?</small>
          </div>
        </h1>
      </div>
    )
  }
  if (count) items = items
    .sort(({ node: nodeA }, { node: nodeB }) => {
      const safewrap = obj => sortRecent ? new Date(obj.githubData.repoMetadata.pushed_at) : obj['stars']
      const metricA = safewrap(nodeA.fields.starterShowcase)
      const metricB = safewrap(nodeB.fields.starterShowcase)
      return metricB - metricA
    })
    .slice(0, count)
  return (
    <div
      css={{
        display: `flex`,
        flexWrap: `wrap`,
        padding: rhythm(3 / 4),
        justifyContent: `center`,
        [presets.Desktop]: {
          justifyContent: `flex-start`,
        },
      }}
    >
      {items
        .map(
          ({ node }) => {
            const {
              githubData,
              description,
              stars,
              githubFullName,
              stub,
              gatsbyDependencies
            } = node.fields.starterShowcase
            const gatsbyVersion = gatsbyDependencies.find(([k, v]) => k === 'gatsby')[1]
            const match = gatsbyVersion
              .match(/([0-9]+)([.])([0-9]+)/) // we just want x.x
            const minorVersion = match ?
              match[0] : gatsbyVersion // default to version if no match
            const isGatsbyVersionWarning =
              !/(2..+|next|latest)/g.test(minorVersion) // either 2.x or next or latest
            const imgsharp = imgsFilter(imgs, stub)
            const repo = githubData.repoMetadata
            const { pushed_at } = repo
            return node.fields && ( // have to filter out null fields from bad data
              <div key={node.id}
                css={{
                  margin: rhythm(3 / 4),
                  width: 280,
                }}
                {...styles.withTitleHover}
              >
                <Link
                  to={{ pathname: `/starters/${stub}`, state: { isModal: true } }}
                  css={{
                    "&&": {
                      borderBottom: `none`,
                      boxShadow: `none`,
                      transition: `all ${presets.animation.speedDefault} ${
                        presets.animation.curveDefault
                        }`,
                      "&:hover": {
                        ...styles.screenshotHover,
                        // manual patch for hover
                        boxShadow: '0 8px 20px rgba(157,124,191,0.5)',
                        transform: 'translateY(-3px)'
                      },
                    },
                  }}
                >
                  <div className="gatsby-image-wrapper" css={{
                    transition: `all ${presets.animation.speedDefault} ${
                      presets.animation.curveDefault
                      }`
                  }}>
                    {imgsharp ? (
                      <Img
                        fluid={imgsharp.childImageSharp.fluid}
                        alt={`Screenshot of ${imgsharp.name}`}
                        css={{
                          ...styles.screenshot,
                          marginBottom: 0
                        }}
                      />
                    ) : (
                        <div
                          css={{
                            // height: 230,
                            width: 320,
                            backgroundColor: `#d999e7`,
                          }}
                        >
                          missing
                  </div>
                      )}
                  </div>
                </Link>
                <div
                  css={{
                    ...scale(-2 / 5),
                    color: `#9B9B9B`,
                    fontWeight: `normal`,
                  }}
                >
                  <div css={{ display: 'flex', justifyContent: 'space-between' }}>{repo.owner && repo.owner.login} /
                    <span>
                      <a href="#copy-to-clipboard" onClick={() => alert(`copied ${githubFullName} to clipboard`) || copyToClipboard(`https://github.com/${githubFullName}`)} css={{ ...styles.noLinkUnderline }}><FaClipboard /> </a>
                      <a href={node.frontmatter.demo} target="_blank" rel="noopener noreferrer" css={{ ...styles.noLinkUnderline }}><FaExtLink /> </a>
                      <a href={`https://github.com/${githubFullName}`} target="_blank" rel="noopener noreferrer" css={{ ...styles.noLinkUnderline }}><FaGithub /> </a>
                    </span>
                  </div>
                  <div>
                    <span className="title">
                      <h5 css={{ margin: 0 }}>
                        <Link to={{ pathname: `/starters/${stub}`, state: { isModal: true } }}>
                          <strong>{repo.name}</strong>
                        </Link>
                      </h5>
                    </span>
                    {isGatsbyVersionWarning ?
                      <span css={{ fontStyle: 'italic', color: 'red' }}>Outdated Version: {minorVersion}</span> :
                      <span css={{ fontStyle: 'italic', color: 'green' }}>Gatsby Version: {minorVersion}</span>
                    }
                  </div>
                  <div css={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{description}</div>
                  <div css={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div css={{ display: 'inline-block' }}><span role="img" aria-label="star">⭐</span>{stars}</div>
                    <div css={{ display: 'inline-block' }}>Updated {(new Date(pushed_at)).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            )
          }
        )}
    </div>
  )
}


// utility functions

// https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
const copyToClipboard = str => {
  const el = document.createElement('textarea');  // Create a <textarea> element
  el.value = str;                                 // Set its value to the string that you want copied
  el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
  el.style.position = 'absolute';
  el.style.left = '-9999px';                      // Move outside the screen to make it invisible
  document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
  const selected =
    document.getSelection().rangeCount > 0        // Check if there is any content selected previously
      ? document.getSelection().getRangeAt(0)     // Store selection if found
      : false;                                    // Mark as false to know no selection existed before
  el.select();                                    // Select the <textarea> content
  document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el);                  // Remove the <textarea> element
  if (selected) {                                 // If a selection existed before copying
    document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
    document.getSelection().addRange(selected);   // Restore the original selection
  }
};

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
      node.frontmatter &&
      isSuperset(node.frontmatter.tags, categories)
  )
  return items
}
function filterByDependencies(list, categories) {
  let items = list

  items = items.filter(
    ({ node }) =>
      node.fields &&
      isSuperset(node.fields.starterShowcase.gatsbyDependencies.map(c => c[0]), categories)
    // node.fields.starterShowcase.gatsbyDependencies.filter(c => categories.has(c[0])).length > 0
  )

  return items
}

function isSuperset(set, subset) {
  for (var elem of subset) {
    if (!set.includes(elem)) {
      return false;
    }
  }
  return true;
}

function imgsFilter(imgs, stub) {
  const result = imgs.filter(img => img.node.name === stub)
  return result.length ? result[0].node : null
}

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
  noLinkUnderline: {
    borderBottom: 'none !important', // i know i know
    boxShadow: 'none !important', // but people really want this
  }
}