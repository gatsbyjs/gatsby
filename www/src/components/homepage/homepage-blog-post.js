import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"
import { Link, graphql } from "gatsby"
import Img from "gatsby-image"
import { MdArrowForward as ArrowForwardIcon } from "react-icons/md"

import Avatar from "../avatar"
import { HorizontalScrollerItem } from "../shared/horizontal-scroller"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const HomepageBlogPostRoot = styled(
  HorizontalScrollerItem.withComponent(`article`)
)`
  display: flex;
  flex-direction: column;
  padding-bottom: ${p => p.theme.space[11]};
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
    margin-bottom: ${p => p.theme.space[8]};
    padding-bottom: calc(${p => p.theme.space[9]} * 2);
    width: ${props => (props.fullWidth ? `100%` : `80%`)};
    transition: transform ${p => p.theme.transition.speed.default}
        ${p => p.theme.transition.curve.default},
      box-shadow ${p => p.theme.transition.speed.default}
        ${p => p.theme.transition.curve.default};

    :hover {
      transform: translateY(-${p => p.theme.space[1]});
      box-shadow: ${p => p.theme.shadows.overlay};
    }

    :active: {
      box-shadow: ${p => p.theme.shadows.cardActive};
      transform: translateY(0);
    }
  }
`

const Cover = styled(Img)`
  border-radius: ${p => p.theme.radii[2]} ${p => p.theme.radii[2]} 0 0;
  display: block;
  margin-bottom: -${p => p.theme.space[3]};
`

const Header = styled(`h1`)`
  font-size: ${p => p.theme.fontSizes[4]};
  font-weight: bold;
  margin: 0;
  padding: ${p => p.theme.space[5]};
  padding-bottom: 0;

  ${mediaQueries.lg} {
    font-size: ${props =>
      props.first ? props.theme.fontSizes[6] : props.theme.fontSizes[5]};
    padding: ${p => p.theme.space[7]};
    padding-bottom: 0;
  }
`

const Meta = styled(`div`)`
  align-items: center;
  color: ${p => p.theme.colors.card.color};
  display: flex;
  flex-wrap: wrap;
  font-size: ${p => p.theme.fontSizes[1]};
  margin-top: ${p => p.theme.space[4]};
  padding: 0 ${p => p.theme.space[5]};

  & > * {
    flex-shrink: 0;
  }

  ${mediaQueries.lg} {
    margin-top: ${p => p.theme.space[6]};
    padding: 0 ${p => p.theme.space[7]};
  }
`

const Author = styled(Link)`
  align-items: center;
  display: flex;
  z-index: 1;

  span {
    color: ${p => p.theme.colors.link.color};
    border-bottom: 1px solid ${p => p.theme.colors.link.border};
  }

  a& {
    font-weight: normal;
  }

  ${mediaQueries.lg} {
    :hover {
      span {
        border-color: ${p => p.theme.colors.link.hoverBorder};
      }
    }
  }
`

const Excerpt = styled(`p`)`
  color: ${p => p.theme.colors.card.color};
  padding: 0 ${p => p.theme.space[5]};

  ${mediaQueries.lg} {
    margin: 0;
    margin-top: ${p => p.theme.space[6]};
    padding: 0 ${p => p.theme.space[7]};
  }
`

const ReadMore = styled(Link)`
  align-items: flex-end;
  background: transparent;
  bottom: 0;
  color: ${p => p.theme.colors.card.color};
  display: flex;
  flex-grow: 1;
  font-size: ${p => p.theme.fontSizes[1]};
  left: 0;
  padding: ${p => p.theme.space[5]};
  position: absolute;
  right: 0;
  top: 0;
  z-index: 0;

  &:hover {
    background: yellow;
  }

  svg {
    height: ${p => p.theme.space[4]};
    width: ${p => p.theme.space[4]};
  }

  span {
    color: ${p => p.theme.colors.link};
    border-bottom: 1px solid ${p => p.theme.colors.link.border};
    font-weight: bold;
    margin-right: ${p => p.theme.space[1]};
  }

  ${mediaQueries.lg} {
    padding: ${p => p.theme.space[7]};

    span {
      :hover {
        border-color: ${p => p.theme.colors.link.hoverBorder};
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
    fields: { slug, excerpt },
    frontmatter: {
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
          <Avatar
            image={authorFixed}
            alt={authorName}
            overrideCSS={{ mr: 3 }}
          />
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
