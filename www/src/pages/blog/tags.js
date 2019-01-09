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
import presets, { colors } from "../../utils/presets"
import { rhythm, options } from "../../utils/typography"

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
              <h1 css={{ margin: 0 }}>Tags</h1>
              <input
                id="tagsFilter"
                name="filterQuery"
                css={{
                  appearance: `none`,
                  backgroundColor: `#ffffff`,
                  border: `1px solid ${colors.lilac}`,
                  borderRadius: presets.radius,
                  color: colors.lilac,
                  paddingTop: rhythm(1 / 8),
                  paddingRight: rhythm(1 / 4),
                  paddingBottom: rhythm(1 / 8),
                  paddingLeft: rhythm(5 / 4),
                  overflow: `hidden`,
                  width: `60%`,
                  height: `45px`,
                  marginLeft: `25px`,
                  ":focus": {
                    color: colors.gatsby,
                    outline: 0,
                  },
                }}
                type="search"
                placeholder="Search tags"
                aria-label="Tag Search"
                title="Filter tag list"
                value={filterQuery}
                onChange={this.handleChange}
              />
            </div>
            <ul
              css={{
                display: `flex`,
                flexFlow: `row wrap`,
                justifyContent: `center`,
                padding: 0,
                margin: 0,
              }}
            >
              {Object.keys(uniqGroup)
                .sort((tagA, tagB) => tagA.localeCompare(tagB))
                .filter(key => uniqGroup[key].fieldValue.includes(filterQuery))
                .map(key => {
                  const tag = uniqGroup[key]
                  return (
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
                })}
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
      filter: { fileAbsolutePath: { regex: "/docs.blog/" } }
    ) {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }
  }
`
