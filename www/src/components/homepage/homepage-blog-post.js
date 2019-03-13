import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"
import { Link, graphql } from "gatsby"
import Img from "gatsby-image"

import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

import { HorizontalScrollerItem } from "../shared/horizontal-scroller"

import presets, { colors, space, radii } from "../../utils/presets"
import { rhythm } from "../../utils/typography"

const HomepageBlogPostRoot = styled(
  HorizontalScrollerItem.withComponent(`article`)
)`
  display: flex;
  flex-direction: column;
  padding-bottom: ${rhythm(2.5)};
  position: relative;

  a {
    border: none;
    font-family: inherit;

    :hover {
      background: transparent;
    }
  }

  ${presets.Md} {
    width: 320px;
  }

  ${presets.Lg} {
    flex-shrink: 0;
    margin-right: 0;
    margin-bottom: ${rhythm(space[8])};
    padding-bottom: ${rhythm(3.5)};
    width: ${props => (props.fullWidth ? `100%` : `80%`)};

    :hover {
      background: ${colors.ui.whisper};
    }
  }
`

const Cover = styled(Img)`
  border-radius: ${radii[2]}px ${radii[2]}px 0 0;
  display: block;
  margin-bottom: -${rhythm(space[3])};
`

const Header = styled(`h1`)`
  color: ${colors.gatsbyDarker};
  font-size: ${presets.scale[4]};
  font-weight: bold;
  margin: 0;
  padding: ${rhythm(4 / 5)};
  padding-bottom: 0;

  ${presets.Lg} {
    font-size: ${props => (props.first ? presets.scale[6] : presets.scale[5])};
    padding: ${rhythm(space[7])};
    padding-bottom: 0;
  }
`

const Meta = styled(`div`)`
  align-items: center;
  color: ${colors.gray.calm};
  display: flex;
  flex-wrap: wrap;
  font-size: ${presets.scale[1]};
  margin-top: ${rhythm(space[4])};
  padding: 0 ${rhythm(4 / 5)};

  & > * {
    flex-shrink: 0;
  }

  ${presets.Lg} {
    margin-top: ${rhythm(space[6])};
    padding: 0 ${rhythm(space[7])};
  }
`

const Author = styled(Link)`
  align-items: center;
  display: flex;
  z-index: 1;

  img {
    border-radius: 50%;
    height: 28px;
    width: 28px;
  }

  span {
    color: ${colors.gatsby};
    border-bottom: 1px solid ${colors.ui.bright};
    margin-left: ${rhythm(space[2])};
  }

  a& {
    font-weight: normal;
  }

  ${presets.Lg} {
    :hover {
      span {
        background: ${colors.ui.bright};
      }
    }
  }
`

const Excerpt = styled(`p`)`
  color: ${colors.gray.copy};
  padding: 0 ${rhythm(4 / 5)};

  ${presets.Lg} {
    margin: 0;
    margin-top: ${rhythm(space[6])};
    padding: 0 ${rhythm(space[7])};
  }
`

const ReadMore = styled(Link)`
  align-items: flex-end;
  background: transparent;
  bottom: 0;
  color: ${colors.gatsby};
  display: flex;
  flex-grow: 1;
  font-size: ${presets.scale[1]};
  left: 0;
  padding: ${rhythm(4 / 5)};
  position: absolute;
  right: 0;
  top: 0;
  z-index: 0;

  &:hover {
    background: yellow;
  }

  svg {
    height: 18px;
    width: 18px;
  }

  span {
    color: ${colors.gatsby};
    border-bottom: 1px solid ${colors.ui.bright};
    font-weight: bold;
    margin-right: ${rhythm(space[1])};
  }

  ${presets.Lg} {
    padding: ${rhythm(space[7])};

    span {
      :hover {
        background: ${colors.ui.bright};
      }
    }
  }
`

const formatDate = (dateString, desktopViewport = false) => {
  const date = new Date(dateString)

  var options = {
    month: `long`,
    day: `numeric`,
    year: `numeric`,
  }

  return date.toLocaleDateString(`en-EN`, desktopViewport ? options : {})
}

const HomepageBlogPost = ({
  post,
  first = false,
  fullWidth = false,
  desktopViewport = false,
}) => {
  const {
    excerpt: automaticExcerpt,
    fields: { slug },
    frontmatter: {
      excerpt: handwrittenExcerpt,
      author: {
        id: authorName,
        avatar: {
          childImageSharp: { fixed: authorFixed },
        },
        fields: { slug: authorSlug },
      },
      date,
      title,
      cover,
    },
  } = post

  const excerpt = handwrittenExcerpt ? handwrittenExcerpt : automaticExcerpt

  return (
    <HomepageBlogPostRoot fullWidth={fullWidth}>
      {desktopViewport && cover && (
        <Cover fluid={cover.childImageSharp.fluid} />
      )}

      <Link to={slug}>
        <Header first={first} withCover={cover}>
          {title}
        </Header>
      </Link>

      <Meta>
        <Author to={authorSlug}>
          <Img fixed={authorFixed} alt={authorName} />
          <span>{authorName}</span>
        </Author>
        &nbsp;on&nbsp;
        {formatDate(date, desktopViewport)}
      </Meta>
      {first && <Excerpt>{excerpt}</Excerpt>}
      <ReadMore to={slug}>
        <span>Read more</span>
        <ArrowForwardIcon />
      </ReadMore>
    </HomepageBlogPostRoot>
  )
}

HomepageBlogPost.propTypes = {
  post: PropTypes.object.isRequired,
  first: PropTypes.bool,
  fullWidth: PropTypes.bool,
  desktopViewport: PropTypes.bool,
}

export const homepageBlogPostFragment = graphql`
  fragment HomepageBlogPostData on MarkdownRemark {
    excerpt
    fields {
      slug
    }
    frontmatter {
      excerpt
      title
      date
      author {
        id
        fields {
          slug
        }
        avatar {
          childImageSharp {
            fixed(
              width: 30
              height: 30
              quality: 80
              traceSVG: {
                turdSize: 10
                background: "#f6f2f8"
                color: "#e0d6eb"
              }
            ) {
              ...GatsbyImageSharpFixed_tracedSVG
            }
          }
        }
      }
      cover {
        childImageSharp {
          fluid(maxWidth: 700, quality: 80) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  }
`

export default HomepageBlogPost
