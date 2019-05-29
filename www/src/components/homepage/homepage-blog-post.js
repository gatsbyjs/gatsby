import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"
import { Link, graphql } from "gatsby"
import Img from "gatsby-image"

import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

import Avatar from "../avatar"

import { HorizontalScrollerItem } from "../shared/horizontal-scroller"

import {
  colors,
  space,
  radii,
  transition,
  shadows,
  fontSizes,
  mediaQueries,
} from "../../utils/presets"
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

  ${mediaQueries.md} {
    width: 20rem;
  }

  ${mediaQueries.lg} {
    flex-shrink: 0;
    margin-right: 0;
    margin-bottom: ${space[8]};
    padding-bottom: ${rhythm(3.5)};
    width: ${props => (props.fullWidth ? `100%` : `80%`)};
    transition: transform ${transition.speed.default}
        ${transition.curve.default},
      box-shadow ${transition.speed.default} ${transition.curve.default};

    :hover {
      transform: translateY(-${space[1]});
      box-shadow: ${shadows.overlay};
    }

    :active: {
      box-shadow: ${shadows.cardActive};
      transform: translateY(0);
    }
  }
`

const Cover = styled(Img)`
  border-radius: ${radii[2]}px ${radii[2]}px 0 0;
  display: block;
  margin-bottom: -${space[3]};
`

const Header = styled(`h1`)`
  font-size: ${fontSizes[4]};
  font-weight: bold;
  margin: 0;
  padding: ${rhythm(4 / 5)};
  padding-bottom: 0;

  ${mediaQueries.lg} {
    font-size: ${props => (props.first ? fontSizes[6] : fontSizes[5])};
    padding: ${space[7]};
    padding-bottom: 0;
  }
`

const Meta = styled(`div`)`
  align-items: center;
  color: ${colors.text.secondary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${fontSizes[1]};
  margin-top: ${space[4]};
  padding: 0 ${rhythm(4 / 5)};

  & > * {
    flex-shrink: 0;
  }

  ${mediaQueries.lg} {
    margin-top: ${space[6]};
    padding: 0 ${space[7]};
  }
`

const Author = styled(Link)`
  align-items: center;
  display: flex;
  z-index: 1;

  span {
    color: ${colors.gatsby};
    border-bottom: 1px solid ${colors.link.border};
  }

  a& {
    font-weight: normal;
  }

  ${mediaQueries.lg} {
    :hover {
      span {
        border-color: ${colors.link.hoverBorder};
      }
    }
  }
`

const Excerpt = styled(`p`)`
  color: ${colors.text.primary};
  padding: 0 ${rhythm(4 / 5)};

  ${mediaQueries.lg} {
    margin: 0;
    margin-top: ${space[6]};
    padding: 0 ${space[7]};
  }
`

const ReadMore = styled(Link)`
  align-items: flex-end;
  background: transparent;
  bottom: 0;
  color: ${colors.gatsby};
  display: flex;
  flex-grow: 1;
  font-size: ${fontSizes[1]};
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
    height: ${space[4]};
    width: ${space[4]};
  }

  span {
    color: ${colors.gatsby};
    border-bottom: 1px solid ${colors.link.border};
    font-weight: bold;
    margin-right: ${space[1]};
  }

  ${mediaQueries.lg} {
    padding: ${space[7]};

    span {
      :hover {
        border-color: ${colors.link.hoverBorder};
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
          <Avatar image={authorFixed} alt={authorName} />
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
  fragment HomepageBlogPostData on Mdx {
    ...BlogPostPreview_item
  }
`

export default HomepageBlogPost
