import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"
import { Link, graphql } from "gatsby"
import Img from "gatsby-image"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

import Avatar from "../avatar"
import { HorizontalScrollerItem } from "../shared/horizontal-scroller"
import { mediaQueries } from "../../gatsby-plugin-theme-ui"

const HomepageBlogPostRoot = styled(
  HorizontalScrollerItem.withComponent(`article`)
)`
  display: flex;
  flex-direction: column;
  padding-bottom: ${props => props.theme.space[11]};
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
    margin-bottom: ${props => props.theme.space[8]};
    padding-bottom: calc(${props => props.theme.space[9]} * 2);
    width: ${props => (props.fullWidth ? `100%` : `80%`)};
    transition: transform ${props => props.theme.transition.speed.default}
        ${props => props.theme.transition.curve.default},
      box-shadow ${props => props.theme.transition.speed.default}
        ${props => props.theme.transition.curve.default};

    :hover {
      transform: translateY(-${props => props.theme.space[1]});
      box-shadow: ${props => props.theme.shadows.overlay};
    }

    :active: {
      box-shadow: ${props => props.theme.shadows.cardActive};
      transform: translateY(0);
    }
  }
`

const Cover = styled(Img)`
  border-radius: ${props => props.theme.radii[2]}px
    ${props => props.theme.radii[2]}px 0 0;
  display: block;
  margin-bottom: -${props => props.theme.space[3]};
`

const Header = styled(`h1`)`
  font-size: ${props => props.theme.fontSizes[4]};
  font-weight: bold;
  margin: 0;
  padding: ${props => props.theme.space[5]};
  padding-bottom: 0;

  ${mediaQueries.lg} {
    font-size: ${props =>
      props.first ? props.theme.fontSizes[6] : props.theme.fontSizes[5]};
    padding: ${props => props.theme.space[7]};
    padding-bottom: 0;
  }
`

const Meta = styled(`div`)`
  align-items: center;
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${props => props.theme.fontSizes[1]};
  margin-top: ${props => props.theme.space[4]};
  padding: 0 ${props => props.theme.space[5]};

  & > * {
    flex-shrink: 0;
  }

  ${mediaQueries.lg} {
    margin-top: ${props => props.theme.space[6]};
    padding: 0 ${props => props.theme.space[7]};
  }
`

const Author = styled(Link)`
  align-items: center;
  display: flex;
  z-index: 1;

  span {
    color: ${props => props.theme.colors.gatsby};
    border-bottom: 1px solid ${props => props.theme.colors.link.border};
  }

  a& {
    font-weight: normal;
  }

  ${mediaQueries.lg} {
    :hover {
      span {
        border-color: ${props => props.theme.colors.link.hoverBorder};
      }
    }
  }
`

const Excerpt = styled(`p`)`
  color: ${props => props.theme.colors.text.primary};
  padding: 0 ${props => props.theme.space[5]};

  ${mediaQueries.lg} {
    margin: 0;
    margin-top: ${props => props.theme.space[6]};
    padding: 0 ${props => props.theme.space[7]};
  }
`

const ReadMore = styled(Link)`
  align-items: flex-end;
  background: transparent;
  bottom: 0;
  color: ${props => props.theme.colors.gatsby};
  display: flex;
  flex-grow: 1;
  font-size: ${props => props.theme.fontSizes[1]};
  left: 0;
  padding: ${props => props.theme.space[5]};
  position: absolute;
  right: 0;
  top: 0;
  z-index: 0;

  &:hover {
    background: yellow;
  }

  svg {
    height: ${props => props.theme.space[4]};
    width: ${props => props.theme.space[4]};
  }

  span {
    color: ${props => props.theme.colors.gatsby};
    border-bottom: 1px solid ${props => props.theme.colors.link.border};
    font-weight: bold;
    margin-right: ${props => props.theme.space[1]};
  }

  ${mediaQueries.lg} {
    padding: ${props => props.theme.space[7]};

    span {
      :hover {
        border-color: ${props => props.theme.colors.link.hoverBorder};
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
