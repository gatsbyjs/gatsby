import React, { Component } from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"
import { Link } from "gatsby"

import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

import HomepageBlogPost, { ScrollerItem } from "./homepage-blog-post"

import presets, { colors } from "../../utils/presets"
import { rhythm, options } from "../../utils/typography"
import { SCROLLER_CLASSNAME } from "../../utils/scrollers-observer"

const ScrollerOuter = styled(`div`)`
  overflow-x: scroll;
  -webkit-overflow-scrolling: touch;
`

const ScrollerInner = styled(`div`)`
  display: inline-flex;
  margin: 0;
  padding: 6px ${rhythm(presets.gutters.default / 2)} 12px;
`

const HomepageBlogPostsRoot = styled(ScrollerOuter)`
  margin: 0 -${rhythm(presets.gutters.default / 2)};

  ${presets.Desktop} {
    margin: 0;
    margin-left: calc(3rem - (${rhythm(options.blockMarginBottom)}));
    margin-right: 1rem;
    overflow-x: auto;
  }

  ${presets.Hd} {
    margin-right: 3rem;
  }
`

const MobilePosts = styled(ScrollerInner)``

const DesktopPosts = styled(`div`)`
  display: flex;
  margin: 0;
  margin-left: calc(3rem - (${rhythm(options.blockMarginBottom)}));
  margin-right: 1rem;

  a {
    border: none;
    box-shadow: none;
    font-family: inherit;

    :hover {
      background: transparent;
    }
  }
`

const DesktopPostsColumn = styled(`div`)`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  flex-basis: 43%;
  margin-right: 30px;
  position: relative;

  :last-child {
    align-items: flex-start;
    margin-right: 0;
    top: 30px;
  }
`

const ViewAllStyle = styled(ScrollerItem)`
  display: flex;
  overflow: hidden;
  font-family: ${options.headerFontFamily.join(`,`)};
  margin-left: ${rhythm(presets.gutters.default)};

  & > a {
    display: flex;
    flex-direction: column;
    font-weight: bold;
    font-size: 1.25rem;
    line-height: 1.2;
    padding: ${rhythm(0.75)};
    width: 100%;

    span {
      align-items: center;
      display: flex;
    }

    svg {
      height: 18x;
      margin-left: 0.2rem;
      width: 18px;
    }
  }

  ${presets.Desktop} {
    background: ${colors.gatsby};
    color: white;
    flex-shrink: 0;
    height: 160px;
    width: 160px;

    &:hover {
      color: ${colors.gatsby};
      background: ${colors.ui.whisper};
    }
  }
`

const AddViewAll = styled(`div`)`
  display: flex;
`

const ViewAll = () => (
  <ViewAllStyle>
    <Link to="/">
      View&nbsp;all
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
    inDesktopViewPort: false,
  }

  componentDidMount = () => {
    this.desktopMediaQuery = window.matchMedia(presets.desktop)
    this.desktopMediaQuery.addListener(this.updateViewPortState)
    this.setState({ inDesktopViewPort: this.desktopMediaQuery.matches })
  }

  componentWillUnmount = () => {
    this.desktopMediaQuery.removeListener(this.updateViewPortState)
  }

  updateViewPortState = e => {
    this.setState({ inDesktopViewPort: this.desktopMediaQuery.matches })
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
    const { inDesktopViewPort } = this.state

    return (
      <React.Fragment>
        {inDesktopViewPort ? (
          <DesktopPosts>
            {postsInColumns.map((column, colIdx) => (
              <DesktopPostsColumn key={`col${colIdx}`}>
                {column.map((post, postIdx) => {
                  const {
                    fields: { slug },
                  } = post

                  if (colIdx & postIdx) {
                    return (
                      <AddViewAll key={slug}>
                        <HomepageBlogPost
                          first={!colIdx && !postIdx}
                          post={post}
                        />
                        <ViewAll />
                      </AddViewAll>
                    )
                  }

                  return (
                    <HomepageBlogPost
                      fullWidth={postIdx === 0}
                      first={!colIdx && !postIdx}
                      key={slug}
                      post={post}
                    />
                  )
                })}
              </DesktopPostsColumn>
            ))}
          </DesktopPosts>
        ) : (
          <HomepageBlogPostsRoot className={SCROLLER_CLASSNAME}>
            <MobilePosts numberOfItems={posts.length}>
              {posts.map((post, idx) => {
                const {
                  fields: { slug },
                } = post
                return <HomepageBlogPost index={idx} key={slug} post={post} />
              })}
              <ViewAll />
            </MobilePosts>
          </HomepageBlogPostsRoot>
        )}
      </React.Fragment>
    )
  }
}

HomepageBlogPosts.propTypes = {
  posts: PropTypes.array.isRequired,
}

export default HomepageBlogPosts
