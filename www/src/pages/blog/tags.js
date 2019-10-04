import React from "react"
import { graphql, Link } from "gatsby"
import styled from "@emotion/styled"
import { Helmet } from "react-helmet"
import PropTypes from "prop-types"
import { kebabCase } from "lodash-es"
import TiArrowRight from "react-icons/lib/ti/arrow-right"

import Button from "../../components/button"
import Layout from "../../components/layout"
import Container from "../../components/container"
import SearchIcon from "../../components/search-icon"
import { TAGS_AND_DOCS } from "../../data/tags-docs"
import styles from "../../views/shared/styles"
import { colors, space, mediaQueries } from "../../utils/presets"

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
  <Button
    small
    secondary
    to={`/blog/tags/${tag}`}
    style={{
      border: `1px solid ${colors.purple[20]}`,
    }}
  >
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
      location,
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
      <Layout location={location}>
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
                borderBottom: `1px solid ${colors.ui.border.subtle}`,
              }}
            >
              Tags ({Object.keys(uniqGroup).length || 0})
            </h1>
            <div />
            <h2>Popular tags</h2>
            <PopularTagGrid>{PopularTagButtons}</PopularTagGrid>
            <div
              css={{
                display: `flex`,
                flexFlow: `row nowrap`,
                justifyContent: `space-between`,
                alignItems: `baseline`,
                paddingBottom: space[4],
              }}
            >
              <h2>All tags</h2>
              <label css={{ position: `relative` }}>
                <input
                  css={styles.searchInput}
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
                    left: space[1],
                    top: `50%`,
                    width: space[4],
                    height: space[4],
                    pointerEvents: `none`,
                    transform: `translateY(-50%)`,
                  }}
                />
              </label>
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
                        padding: `${space[3]} ${space[1]}`,
                        margin: space[4],
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
