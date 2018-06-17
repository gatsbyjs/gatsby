import React, { Component } from "react"
import Helmet from "react-helmet"
import { Link } from "gatsby"
// import Img from "gatsby-image"
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
// import FeaturedSitesIcon from "../assets/featured-sites-icons.svg"
import { options, /* rhythm, */ scale, rhythm } from "../utils/typography"
import presets, { colors } from "../utils/presets"
import { style } from "glamor"
import hex2rgba from "hex2rgba"

// main components

class StarterShowcasePage extends Component {
  render() {
    const data = this.props.data
    const location = this.props.location
    console.log('page props', this.props)
    // let windowWidth
    // if (typeof window !== `undefined`) {
    //   windowWidth = window.innerWidth
    // }

    // const isDesktop = windowWidth > 750
    return (
      <Layout location={location}>
        <Helmet>
          <title>Showcase</title>
        </Helmet>
        <FilteredShowcase data={data} />
      </Layout>
    )
  }
}

export default StarterShowcasePage

export const showcaseQuery = graphql`
query ShowcaseQuery {
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
    search: ``,
    sitesToShow: 9,
    filtersCategory: new Set([]),
    filtersDependency: new Set([]),
  }
  setFiltersCategory = filtersCategory => this.setState({ filtersCategory })
  setFiltersDependency = filtersDependency => this.setState({ filtersDependency })
  resetFilters = () => this.setState({
    filtersCategory: new Set([]),
    filtersDependency: new Set([]),
  })
  render() {
    const { data } = this.props
    const { filtersCategory, filtersDependency } = this.state
    const { setFiltersCategory, setFiltersDependency, resetFilters } = this
    // https://stackoverflow.com/a/32001444/1106414
    const filters = new Set([].concat(...[filtersCategory, filtersDependency].map(set => Array.from(set))))
    let windowWidth
    if (typeof window !== `undefined`) {
      windowWidth = window.innerWidth
    }

    const isDesktop = windowWidth > 750

    let items = data.allMarkdownRemark.edges

    if (this.state.search.length > 0) {
      items = items.filter(node => {
        // TODO: SWYX: very very simple object search algorithm, i know, sorry
        const { fields, frontmatter } = node.node
        if (fields) frontmatter.fields = fields.starterShowcase
        return JSON.stringify(frontmatter).toLowerCase().includes(this.state.search)
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
                  onClick={resetFilters}
                >
                  <MdClear style={{ marginRight: rhythm(1 / 4) }} /> Reset all
                  Filters
                </button>
              </div>
            )}
            <LHSFilter heading="Categories" data={Array.from(
              count(data.allMarkdownRemark.edges.map(({ node }) => node.frontmatter && node.frontmatter.tags))
            )} filters={filtersCategory} setFilters={setFiltersCategory} />
            <LHSFilter heading="Gatsby Dependencies" data={Array.from(
              count(data.allMarkdownRemark.edges.map(({ node }) => node.fields && node.fields.starterShowcase.gatsbyDependencies.map(str => str[0])))
            )} filters={filtersDependency} setFilters={setFiltersDependency} />
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
                    All {data.allMarkdownRemark.edges.length} Showcase Sites
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
      // <div css={{ display: `flex` }}>
      //   {isDesktop && (
      //     <div css={{ flexBasis: `18rem`, minWidth: `18rem` }}>
      //       <h3>
      //         Filter & Refine <MdFilterList />
      //       </h3>
      //       <LHSFilter heading="Categories" data={Array.from(
      //         count(data.allMarkdownRemark.edges.map(({ node }) => node.frontmatter && node.frontmatter.tags))
      //       )} filters={filtersCategory} setFilters={setFiltersCategory} />
      //       <LHSFilter heading="Gatsby Dependencies" data={Array.from(
      //         count(data.allMarkdownRemark.edges.map(({ node }) => node.fields && node.fields.starterShowcase.gatsbyDependencies.map(str => str[0])))
      //       )} filters={filtersDependency} setFilters={setFiltersDependency} />
      //     </div>
      //   )}
      //   <div>
      //     <div
      //       css={{
      //         display: `flex`,
      //         alignItems: `center`,
      //         flexDirection: isDesktop ? `row` : `column`,
      //       }}
      //     >
      //       <h5 css={{ flexGrow: 1 }} id="search-heading">
      //         {this.state.search.length === 0 ? (
      //           filters.size === 0 ? (
      //             <span>
      //               {data.allMarkdownRemark.edges.length} Starters to jump-start your new website
      //             </span>
      //           ) : (
      //               <span>
      //                 {items.length}
      //                 {` `}
      //                 {filters.size === 1 && filters.values()[0]}
      //                 {` `}
      //                 Starters
      //             </span>
      //             )
      //         ) : (
      //             <span>{items.length} search results</span>
      //           )}
      //       </h5>
      //       {/* TODO: maybe have a site submission issue template */}
      //       <a
      //         href="https://github.com/gatsbyjs/gatsby/issues/new?template=feature_request.md"
      //         target="_blank"
      //         rel="noopener noreferrer"
      //       >
      //         <div
      //           css={{
      //             backgroundColor: `#663399`,
      //             color: `white`,
      //             padding: `5px 10px`,
      //             fontWeight: `normal`,
      //           }}
      //         >
      //           Submit your Starter
      //           <div css={{ marginLeft: `5px`, display: `inline` }}>→</div>
      //         </div>
      //       </a>
      //       <div>
      //         <label css={{ position: `relative` }}>
      //           <input
      //             css={{
      //               paddingLeft: `1.4rem`,
      //             }}
      //             type="text"
      //             value={this.state.search}
      //             onChange={e =>
      //               this.setState({
      //                 search: e.target.value,
      //               })
      //             }
      //             placeholder="Search"
      //           />
      //           <SearchIcon
      //             overrideCSS={{
      //               // ...iconStyles,
      //               // fill: focussed && colors.gatsby,
      //               position: `absolute`,
      //               left: `5px`,
      //               top: `50%`,
      //               width: `16px`,
      //               height: `16px`,
      //               pointerEvents: `none`,
      //               // transition: `fill ${speedDefault} ${curveDefault}`,
      //               transform: `translateY(-50%)`,

      //               // [presets.Hd]: {
      //               //   fill: focussed && isHomepage && colors.gatsby,
      //               // },
      //             }}
      //           />
      //         </label>
      //       </div>
      //     </div>
      //     <ShowcaseList items={items} count={this.state.sitesToShow} />
      //     {this.state.sitesToShow < items.length && (
      //       <button
      //         css={{
      //           backgroundColor: `#663399`,
      //           color: `white`,
      //           marginTop: 15,
      //           marginBottom: 60,
      //           width: !isDesktop && `100%`,
      //           padding: !isDesktop && `15px`,
      //         }}
      //         onClick={() => {
      //           this.setState({ sitesToShow: this.state.sitesToShow + 9 })
      //         }}
      //       >
      //         Load More
      //         <div css={{ marginLeft: `5px`, display: `inline` }}>↓</div>
      //       </button>
      //     )}
      //   </div>
      // </div>
    )
  }
}

function LHSFilter({ heading, data, filters, setFilters }) {
  return (
    <Collapsible heading={heading}>
      {data
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


const ShowcaseList = ({ items, count }) => {
  if (count) items = items.slice(0, count)
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
      {items.map(
        ({ node }) => {
          const {
            githubData,
            description,
            stars,
            lastUpdated,
            githubFullName
          } = node.fields.starterShowcase
          const repo = githubData.repoMetadata
          return node.fields && ( // have to filter out null fields from bad data
            <div key={node.id}
              css={{
                margin: rhythm(3 / 4),
                width: 280,
              }}
              {...styles.withTitleHover}
            >
              <Link
                to={{ pathname: `/starters/${node.fields.starterShowcase.stub}`, state: { isModal: true } }}
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
                  {node.fields.starterShowcase ? (
                    <img
                      src={`/StarterShowcase/generatedScreenshots/${node.fields.starterShowcase.stub}.png`}
                      width={282}
                      height={211}
                      alt={`Screenshot of ${node.fields.starterShowcase.stub}`}
                      css={{
                        ...styles.screenshot,
                        marginBottom: 0
                      }}
                    />
                  ) : (
                      <div
                        css={{
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
                    <a href="#copy-to-clipboard" onClick={() => copyToClipboard(`https://github.com/${githubFullName}`)}><FaClipboard /> </a>
                    <a href={node.frontmatter.demo} target="_blank" rel="noopener noreferrer"><FaExtLink /> </a>
                    <a href={`https://github.com/${githubFullName}`} target="_blank" rel="noopener noreferrer"><FaGithub /> </a>
                  </span>
                </div>
                <div>
                  <span className="title">
                    {/* <Link
                      to={{ pathname: `/starters/${node.fields.starterShowcase.stub}`, state: { isModal: true } }}> */}
                    <h5 css={{ margin: 0 }}><strong>{repo.name}</strong></h5>
                    {/* </Link> */}
                  </span>
                </div>
                <div css={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{description}</div>
                <div><span role="img" aria-label="star">⭐</span>{stars} Updated {(new Date(lastUpdated)).toLocaleDateString()}</div>
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
