import React, { Component } from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"
import { Link } from "gatsby"

import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

import HomepageBlogPost from "./homepage-blog-post"
import {
  HorizontalScroller,
  HorizontalScrollerContent,
  HorizontalScrollerItem,
} from "../shared/horizontal-scroller"

import presets, { colors } from "../../utils/presets"
import { rhythm, options } from "../../utils/typography"
import { SCROLLER_CLASSNAME } from "../../utils/scrollers-observer"

const HomepageBlogPostsRootMobile = styled(HorizontalScroller)`
  margin: -6px -${rhythm(presets.gutters.default / 2)};
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
  margin-right: ${rhythm(presets.gutters.default)};
  position: relative;

  :last-child {
    align-items: flex-start;
    margin-right: 0;
    top: 30px;
  }
`

const ViewAllStyle = styled(HorizontalScrollerItem.withComponent(`div`))`
  display: flex;
  font-family: ${options.headerFontFamily.join(`,`)};
  overflow: hidden;
  width: auto;

  a {
    box-shadow: none;
    border: 0;
    display: flex;
    flex-direction: column;
    font-weight: bold;
    font-size: 1.25rem;
    justify-content: center;
    line-height: 1.2;
    padding: ${rhythm(1.5)};
    width: 100%;

    span {
      align-items: center;
      display: flex;
    }

    svg {
      height: 18px;
      margin-left: 0.2rem;
      width: 18px;
    }
  }

  ${presets.Desktop} {
    background: ${colors.gatsby};
    color: white;
    flex-shrink: 0;
    height: 160px;

    margin-left: ${rhythm(presets.gutters.default)};
    width: 125px;

    a {
      padding: ${rhythm(1)};
      justify-content: flex-start;

      &:hover {
        color: ${colors.gatsby};
        background: ${colors.ui.whisper};
      }
    }
  }

  ${presets.Hd} {
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
    this.desktopMediaQuery = window.matchMedia(presets.desktop)
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
      <React.Fragment>
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
      </React.Fragment>
    )
  }
}

HomepageBlogPosts.propTypes = {
  posts: PropTypes.array.isRequired,
}

export default HomepageBlogPosts
