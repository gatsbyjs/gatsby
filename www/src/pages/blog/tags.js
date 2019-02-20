import React from "react"
import PropTypes from "prop-types"
import { graphql } from "gatsby"

// Utilities
import kebabCase from "lodash/kebabCase"

// Components
import { Helmet } from "react-helmet"
import { Link } from "gatsby"
import Layout from "../../components/layout"
import Container from "../../components/container"
import SearchIcon from "../../components/search-icon"
import styles from "../../views/shared/styles"
import { colors } from "../../utils/presets"
import { rhythm, options } from "../../utils/typography"

let currentLetter = ``

class TagsPage extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      allMarkdownRemark: PropTypes.shape({
        group: PropTypes.arrayOf(
          PropTypes.shape({
            fieldValue: PropTypes.string.isRequired,
            totalCount: PropTypes.number.isRequired,
          }).isRequired
        ),
      }),
    }),
  }

  constructor(props) {
    super(props)
    this.state = {
      filterQuery: ``,
    }
  }

  handleChange = ({ target: { name, value } }) => {
    currentLetter = ``
    this.setState({ [name]: value })
  }

  render() {
    const {
      data: {
        allMarkdownRemark: { group },
      },
      location,
    } = this.props
    const { filterQuery } = this.state
    const uniqGroup = group.reduce((lookup, tag) => {
      const key = kebabCase(tag.fieldValue.toLowerCase())
      if (!lookup[key]) {
        lookup[key] = Object.assign(tag, {
          slug: `/blog/tags/${key}`,
        })
      }
      return lookup
    }, {})
    const results = Object.keys(uniqGroup)
      .sort((tagA, tagB) => tagA.localeCompare(tagB))
      .filter(key => uniqGroup[key].fieldValue.includes(filterQuery))

    return (
      <Layout location={location}>
        <Container>
          <Helmet title="Tags" />
          <div>
            <div
              css={{
                display: `flex`,
                flexFlow: `row nowrap`,
                justifyContent: `space-between`,
                alignItems: `center`,
                paddingTop: rhythm(options.blockMarginBottom * 2),
                paddingBottom: rhythm(options.blockMarginBottom),
                borderBottom: `1px solid ${colors.ui.border}`,
              }}
            >
              <h1 css={{ margin: 0 }}>
                Tags ({Object.keys(uniqGroup).length || 0})
              </h1>
              <div>
                <label css={{ position: `relative` }}>
                  <input
                    css={{
                      ...styles.searchInput,
                    }}
                    id="tagsFilter"
                    name="filterQuery"
                    type="search"
                    placeholder="Search tags"
                    aria-label="Tag Search"
                    title="Filter tag list"
                    value={filterQuery}
                    onChange={this.handleChange}
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
            <ul
              css={{
                display: `flex`,
                flexFlow: `row wrap`,
                justifyContent: `start`,
                padding: 0,
                margin: 0,
              }}
            >
              {results.length > 0 ? (
                results.map(key => {
                  const tag = uniqGroup[key]
                  const firstLetter = tag.fieldValue.charAt(0).toLowerCase()
                  const buildTag = (
                    <li
                      key={tag.fieldValue}
                      css={{
                        padding: `10px 5px`,
                        margin: `15px`,
                        listStyleType: `none`,
                      }}
                    >
                      <Link to={tag.slug}>
                        {tag.fieldValue} ({tag.totalCount})
                      </Link>
                    </li>
                  )

                  if (currentLetter !== firstLetter) {
                    currentLetter = firstLetter
                    return (
                      <React.Fragment>
                        <h4 css={{ width: `100%`, flexBasis: `100%` }}>
                          {currentLetter.toUpperCase()}
                        </h4>
                        {buildTag}
                      </React.Fragment>
                    )
                  }
                  return buildTag
                })
              ) : (
                <h4>
                  No tags found for &quot;
                  {filterQuery}
                  &quot; 😔
                </h4>
              )}
            </ul>
          </div>
        </Container>
      </Layout>
    )
  }
}

export default TagsPage

export const pageQuery = graphql`
  query {
    allMarkdownRemark(
      limit: 2000
      filter: {
        fields: { released: { eq: true } }
        fileAbsolutePath: { regex: "/docs.blog/" }
      }
    ) {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }
  }
`
