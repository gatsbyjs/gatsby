import React, { Component } from "react"
import Helmet from "react-helmet"
import { Link } from "gatsby"
// import Img from "gatsby-image"
import Layout from "../components/layout"
import SearchIcon from "../components/search-icon"
import { /* options, rhythm, */ scale } from "../utils/typography"
import { /*presets,*/ colors } from "../utils/presets"
import MdFilterList from "react-icons/lib/md/filter-list"
import FaAngleDown from "react-icons/lib/fa/angle-down"
import FaAngleUp from "react-icons/lib/fa/angle-up"
import FaExtLink from "react-icons/lib/fa/external-link"
import FaGithub from "react-icons/lib/fa/github"
import FaClipboard from "react-icons/lib/fa/clipboard"
// import FeaturedSitesIcon from "../assets/featured-sites-icons.svg"

// main components

class StarterShowcasePage extends Component {
  render() {
    const data = this.props.data
    const location = this.props.location
    console.log({ location })
    // let windowWidth
    // if (typeof window !== `undefined`) {
    //   windowWidth = window.innerWidth
    // }

    // const isDesktop = windowWidth > 750
    return (
      <Layout location={location}>
        <div css={{ margin: `20px 30px` }}>
          <Helmet>
            <title>Showcase</title>
          </Helmet>
          <FilteredShowcase data={data} />
        </div>
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

  render() {
    const { data } = this.props
    const { filtersCategory, filtersDependency } = this.state
    const { setFiltersCategory, setFiltersDependency } = this
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
      <div css={{ display: `flex` }}>
        {isDesktop && (
          <div css={{ flexBasis: `18rem`, minWidth: `18rem` }}>
            <h3>
              Filter & Refine <MdFilterList />
            </h3>
            <LHSFilter heading="Categories" data={Array.from(
              count(data.allMarkdownRemark.edges.map(({ node }) => node.frontmatter && node.frontmatter.tags))
            )} filters={filtersCategory} setFilters={setFiltersCategory} />
            <LHSFilter heading="Gatsby Dependencies" data={Array.from(
              count(data.allMarkdownRemark.edges.map(({ node }) => node.fields && node.fields.starterShowcase.gatsbyDependencies.map(str => str[0])))
            )} filters={filtersDependency} setFilters={setFiltersDependency} />
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
            <h5 css={{ flexGrow: 1 }} id="search-heading">
              {this.state.search.length === 0 ? (
                filters.size === 0 ? (
                  <span>
                    {data.allMarkdownRemark.edges.length} Starters to jump-start your new website
                  </span>
                ) : (
                    <span>
                      {items.length}
                      {` `}
                      {filters.size === 1 && filters.values()[0]}
                      {` `}
                      Starters
                  </span>
                  )
              ) : (
                  <span>{items.length} search results</span>
                )}
            </h5>
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
                Submit your Starter
                <div css={{ marginLeft: `5px`, display: `inline` }}>→</div>
              </div>
            </a>
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
          <ul key={c}>
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
              <div css={{ textAlign: 'left' }}>{c.replace(/^gatsby-/, '*-')}</div> {/* remove "gatsby" at display only */}
              <div
                className="rule"
                css={{
                  visibility: `hidden`,
                  backgroundColor: colors.gatsby,
                  // width: `100%`,
                  flex: 1,
                  height: `1px`,
                  margin: `10px`,
                }}
              />
              <div>{count}</div>
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


const ShowcaseList = ({ items, count }) => {
  if (count) items = items.slice(0, count)
  return (
    <div css={{ display: `grid`, gridGap: 30, gridTemplateColumns: `repeat(3, minmax(282px, 1fr))` }}>
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
            <div key={node.id} css={{ margin: `12px` }}>
              <Link
                to={{ pathname: `/starters/${node.fields.starterShowcase.stub}`, state: { isModal: true } }}
                css={{
                  borderBottom: `none !important`,
                  boxShadow: `none !important`,
                }}
              >
                {node.fields.starterShowcase ? (
                  <img
                    src={`/StarterShowcase/generatedScreenshots/${node.fields.starterShowcase.stub}.png`}
                    width={282}
                    height={211}
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
                    <a onClick={() => copyToClipboard(`gatsby new https://github.com/${githubFullName}`)}><FaClipboard /> </a>
                    <a href={node.frontmatter.demo} target="_blank" rel="noopener noreferrer"><FaExtLink /> </a>
                    <a href={`https://github.com/${githubFullName}`} target="_blank" rel="noopener noreferrer"><FaGithub /> </a>
                  </span>
                </div>
                <h5 css={{ margin: 0 }}><strong>{repo.name}</strong></h5>
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
