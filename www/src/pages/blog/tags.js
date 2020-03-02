/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { graphql, Link } from "gatsby"
import styled from "@emotion/styled"
import { Helmet } from "react-helmet"
import PropTypes from "prop-types"
import { kebabCase } from "lodash-es"
import TiArrowRight from "react-icons/lib/ti/arrow-right"

import Button from "../../components/button"
import Container from "../../components/container"
import SearchIcon from "../../components/search-icon"
import FooterLinks from "../../components/shared/footer-links"
import { TAGS_AND_DOCS } from "../../data/tags-docs"
import { themedInput } from "../../utils/styles"
import {
  colors,
  space,
  mediaQueries,
} from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const POPULAR_TAGS = [
  `themes`,
  `case-studies`,
  `content-mesh`,
  `plugins`,
  `accessibility`,
  `graphql`,
  `netlify`,
  `performance`,
  `wordpress`,
  `releases`,
  `community`,
  `contentful`,
]

const PopularTagGrid = styled.div`
  display: grid;
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: ${space[2]};
  ${mediaQueries.md} {
    grid-template-columns: repeat(4, 1fr);
  }
`

const PopularTagButton = ({ children, tag }) => (
  <Button variant="small" secondary to={`/blog/tags/${tag}`}>
    {tag}
    <TiArrowRight />
    {children}
  </Button>
)

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
    } = this.props
    const { filterQuery } = this.state
    const uniqGroup = group
      .filter(x => TAGS_AND_DOCS.has(x.fieldValue))
      .reduce((lookup, tag) => {
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

    let PopularTagButtons = []
    POPULAR_TAGS.forEach(key => {
      PopularTagButtons.push(<PopularTagButton tag={key} />)
    })

    return (
      <Container>
        <Helmet>
          <title>Tags</title>
          <meta
            name={`description`}
            content={`Find case studies, tutorials, and more about Gatsby related topics by tag`}
          />
        </Helmet>
        <div>
          <h1
            css={{
              padding: `${space[6]} 0`,
              margin: 0,
              borderBottom: `1px solid ${colors.ui.border}`,
            }}
          >
            Tags ({Object.keys(uniqGroup).length || 0})
          </h1>
          <div />
          <h2>Popular tags</h2>
          <PopularTagGrid>{PopularTagButtons}</PopularTagGrid>
          <div
            sx={{
              display: `flex`,
              flexFlow: `row nowrap`,
              justifyContent: `space-between`,
              pb: 4,
              alignItems: `center`,
            }}
          >
            <h2>All tags</h2>
            <label css={{ position: `relative` }}>
              <input
                sx={{ ...themedInput, pl: 7 }}
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
        <FooterLinks />
      </Container>
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
