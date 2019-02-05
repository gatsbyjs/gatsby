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

const TagsPage = ({
  data: {
    allMarkdownRemark: { group },
  },
  location,
}) => {
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
          <h1>Tags</h1>
          <ul>
            {Object.keys(uniqGroup)
              .sort((tagA, tagB) => tagA.localeCompare(tagB))
              .map(key => {
                const tag = uniqGroup[key]
                return (
                  <li key={tag.fieldValue}>
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

TagsPage.propTypes = {
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
