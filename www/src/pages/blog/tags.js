/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { Helmet } from "react-helmet"
import PropTypes from "prop-types"
import { graphql, Link } from "gatsby"
import { kebabCase } from "lodash-es"

import Layout from "../../components/layout"
import Container from "../../components/container"
import SearchIcon from "../../components/search-icon"
import { searchInputStyles } from "../../utils/styles"

let currentLetter = ``

class TagsPage extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      allMdx: PropTypes.shape({
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
        allMdx: { group },
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
      } else {
        lookup[key].totalCount += tag.totalCount
      }
      // Prefer spaced tag names (instead of hyphenated) for display
      if (tag.fieldValue.includes(` `)) {
        lookup[key].fieldValue = tag.fieldValue
      }
      return lookup
    }, {})
    const results = Object.keys(uniqGroup)
      .sort((tagA, tagB) => tagA.localeCompare(tagB))
      .filter(key => uniqGroup[key].fieldValue.includes(filterQuery))

    return (
      <Layout location={location}>
        <Container>
          <Helmet>
            <title>Tags</title>
            <meta
              name="description"
              content="Find case studies, tutorials, and more about Gatsby related topics by tag"
            />
          </Helmet>
          <div>
            <div
              sx={{
                display: `flex`,
                flexFlow: `row nowrap`,
                justifyContent: `space-between`,
                alignItems: `center`,
                pt: 9,
                pb: 6,
                borderBottom: t => `1px solid ${t.colors.ui.border.subtle}`,
              }}
            >
              <h1 sx={{ m: 0 }}>Tags ({Object.keys(uniqGroup).length || 0})</h1>
              <div>
                <label sx={{ position: `relative` }}>
                  <input
                    sx={searchInputStyles}
                    id="tagsFilter"
                    name="filterQuery"
                    type="search"
                    placeholder="Search tags"
                    aria-label="Tag Search"
                    title="Filter tag list"
                    value={filterQuery}
                    onChange={this.handleChange}
                  />
                  <SearchIcon />
                </label>
              </div>
            </div>
            <ul
              sx={{
                display: `flex`,
                flexFlow: `row wrap`,
                justifyContent: `start`,
                p: 0,
                m: 0,
              }}
            >
              {results.length > 0 ? (
                results.map(key => {
                  const tag = uniqGroup[key]
                  const firstLetter = tag.fieldValue.charAt(0).toLowerCase()
                  const buildTag = (
                    <li
                      key={tag.fieldValue}
                      sx={{
                        py: 3,
                        px: 1,
                        m: 4,
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
                      <React.Fragment key={`letterheader-${currentLetter}`}>
                        <h4 sx={{ width: `100%`, flexBasis: `100%` }}>
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
    allMdx(
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
