import React, { Component } from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"
import { Link } from "gatsby"

import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

import HomepageBlogPost from "./homepage-blog-post"
import {
  HorizontalScroller,
  HorizontalScrollerContent,
  HorizontalScrollerItem,
} from "../shared/horizontal-scroller"

import {
  colors,
  space,
  breakpoints,
  mediaQueries,
  fontSizes,
  lineHeights,
  fonts,
} from "../../utils/presets"
import { SCROLLER_CLASSNAME } from "../../utils/scrollers-observer"

const HomepageBlogPostsRootMobile = styled(HorizontalScroller)`
  margin: -6px -${space[6]};
`

const HorizontalScrollerContentAsDiv = HorizontalScrollerContent.withComponent(
  `div`
)

const HomepageBlogPostsRootDesktop = styled(`div`)`
  display: flex;
`

const PostsColumn = styled(`div`)`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  flex-basis: 45%;
  margin-right: ${space[8]};
  position: relative;

  :last-child {
    align-items: flex-start;
    margin-right: 0;
    top: 30px;
  }
`

const ViewAllStyle = styled(HorizontalScrollerItem.withComponent(`div`))`
  display: flex;
  font-family: ${fonts.header};
  overflow: hidden;
  width: auto;

  a {
    box-shadow: none;
    border: 0;
    display: flex;
    flex-direction: column;
    font-weight: bold;
    font-size: ${fontSizes[4]};
    justify-content: center;
    line-height: ${lineHeights.dense};
    padding: ${space[7]};
    width: 100%;

    span {
      align-items: center;
      display: flex;
    }

    svg {
      height: 18px;
      margin-left: ${space[1]};
      width: 18px;
    }
  }

  ${mediaQueries.lg} {
    background: ${colors.gatsby};
    color: ${colors.white};
    flex-shrink: 0;
    height: 160px;

    margin-left: ${space[8]};
    width: 125px;

    a {
      color: ${colors.white};
      padding: ${space[5]};
      justify-content: flex-start;

      &:hover {
        background: ${colors.purple[80]};
      }
    }
  }

  ${mediaQueries.xl} {
    width: 160px;
  }
`

const LastPost = styled(`div`)`
  display: flex;
  width: 100%;
`

const ViewAll = () => (
  <ViewAllStyle>
    <Link to="/blog/">
      View all
      <span>
        posts
        <ArrowForwardIcon />
      </span>
    </Link>
  </ViewAllStyle>
)

class HomepageBlogPosts extends Component {
  desktopMediaQuery

  state = {
    desktopViewport: false,
  }

  componentDidMount = () => {
    this.desktopMediaQuery = window.matchMedia(`(min-width: ${breakpoints.lg}`)
    this.desktopMediaQuery.addListener(this.updateViewPortState)
    this.setState({ desktopViewport: this.desktopMediaQuery.matches })
  }

  componentWillUnmount = () => {
    this.desktopMediaQuery.removeListener(this.updateViewPortState)
  }

  updateViewPortState = e => {
    this.setState({ desktopViewport: this.desktopMediaQuery.matches })
  }

  splitPostsToColumns = posts =>
    posts.reduce(
      (merge, post, idx) => {
        if (idx % 2) {
          merge[1].push(post)
        } else {
          merge[0].push(post)
        }

        return merge
      },
      [[], []]
    )

  render() {
    const { posts } = this.props
    const postsInColumns = this.splitPostsToColumns(posts)
    const { desktopViewport } = this.state

    return (
      <>
        {desktopViewport ? (
          <HomepageBlogPostsRootDesktop>
            {postsInColumns.map((column, colIdx) => (
              <PostsColumn key={`col${colIdx}`}>
                {column.map((post, postIdx) => {
                  const {
                    fields: { slug },
                  } = post

                  const firstPost = !colIdx && !postIdx
                  const lastPost = colIdx & postIdx

                  if (lastPost) {
                    {
                      /* add 'View all posts' link as a sibling of the last post card */
                    }
                    return (
                      <LastPost key={slug}>
                        <HomepageBlogPost
                          post={post}
                          desktopViewport={desktopViewport}
                        />
                        <ViewAll />
                      </LastPost>
                    )
                  }

                  return (
                    <HomepageBlogPost
                      fullWidth={postIdx === 0}
                      first={firstPost}
                      key={slug}
                      post={post}
                      desktopViewport={desktopViewport}
                    />
                  )
                })}
              </PostsColumn>
            ))}
          </HomepageBlogPostsRootDesktop>
        ) : (
          <HomepageBlogPostsRootMobile className={SCROLLER_CLASSNAME}>
            <HorizontalScrollerContentAsDiv>
              {posts.map((post, idx) => {
                const {
                  fields: { slug },
                } = post
                return <HomepageBlogPost index={idx} key={slug} post={post} />
              })}
              <ViewAll />
            </HorizontalScrollerContentAsDiv>
          </HomepageBlogPostsRootMobile>
        )}
      </>
    )
  }
}

HomepageBlogPosts.propTypes = {
  posts: PropTypes.array.isRequired,
}

export default HomepageBlogPosts
