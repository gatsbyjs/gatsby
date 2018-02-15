import React from "react"
import Helmet from "react-helmet"
import { Link } from "gatsby"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"
import ArrowBackIcon from "react-icons/lib/md/arrow-back"
import Img from "gatsby-image"

import presets, { colors } from "../utils/presets"
import typography, { rhythm, scale, options } from "../utils/typography"
import Container from "../components/container"
import EmailCaptureForm from "../components/email-capture-form"

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    const prev = this.props.pageContext.prev
    const next = this.props.pageContext.next
    const prevNextLinkStyles = {
      "&&": {
        boxShadow: `none`,
        borderBottom: 0,
        fontFamily: options.headerFontFamily.join(`,`),
        fontWeight: `bold`,
        color: colors.gatsby,
      },
    }
    const prevNextLabelStyles = {
      marginTop: 0,
      marginBottom: 0,
      color: colors.gray.calm,
      fontWeight: `normal`,
      ...scale(0),
      lineHeight: 1,
    }
    const BioLine = ({ children }) => (
      <p
        css={{
          ...scale(-2 / 5),
          fontFamily: typography.options.headerFontFamily.join(`,`),
          lineHeight: 1.3,
          margin: 0,
          color: colors.gray.calm,
          [presets.Mobile]: {
            ...scale(-1 / 5),
            lineHeight: 1.3,
          },
        }}
      >
        {children}
      </p>
    )
    return (
      <div>
        <Container className="post" css={{ paddingBottom: `0 !important` }}>
          {/* Add long list of social meta tags */}
          <Helmet>
            <title>{post.frontmatter.title}</title>
            <link
              rel="author"
              href={`https://gatsbyjs.org${
                post.frontmatter.author.fields.slug
              }`}
            />
            <meta
              name="description"
              content={
                post.frontmatter.excerpt
                  ? post.frontmatter.excerpt
                  : post.excerpt
              }
            />

            <meta name="og:description" content={post.excerpt} />
            <meta name="twitter:description" content={post.excerpt} />
            <meta name="og:title" content={post.frontmatter.title} />
            {post.frontmatter.image && (
              <meta
                name="og:image"
                content={`https://gatsbyjs.org${
                  post.frontmatter.image.childImageSharp.resize.src
                }`}
              />
            )}
            {post.frontmatter.image && (
              <meta
                name="twitter:image"
                content={`https://gatsbyjs.org${
                  post.frontmatter.image.childImageSharp.resize.src
                }`}
              />
            )}
            <meta name="og:type" content="article" />
            <meta name="article:author" content={post.frontmatter.author.id} />
            <meta
              name="twitter:creator"
              content={post.frontmatter.author.twitter}
            />
            <meta name="author" content={post.frontmatter.author.id} />
            <meta name="twitter:label1" content="Reading time" />
            <meta
              name="twitter:data1"
              content={`${post.timeToRead} min read`}
            />
            <meta
              name="article:published_time"
              content={post.frontmatter.rawDate}
            />
          </Helmet>
          <header
            css={{
              display: `flex`,
              marginTop: rhythm(-1 / 4),
              marginBottom: rhythm(1),
              [presets.Tablet]: {
                marginTop: rhythm(1 / 2),
                marginBottom: rhythm(2),
              },
            }}
          >
            <div
              css={{
                flex: `0 0 auto`,
              }}
            >
              <Img
                resolutions={
                  post.frontmatter.author.avatar.childImageSharp.resolutions
                }
                css={{
                  height: rhythm(2.3),
                  width: rhythm(2.3),
                  margin: 0,
                  borderRadius: `100%`,
                  display: `inline-block`,
                  verticalAlign: `middle`,
                }}
              />
            </div>
            <div
              css={{
                flex: `1 1 auto`,
                marginLeft: rhythm(1 / 2),
              }}
            >
              <Link to={post.frontmatter.author.fields.slug}>
                <h4
                  css={{
                    ...scale(0),
                    fontWeight: 400,
                    margin: 0,
                  }}
                >
                  {post.frontmatter.author.id}
                </h4>
              </Link>
              <BioLine>{post.frontmatter.author.bio}</BioLine>
              <BioLine>
                {post.timeToRead} min read · {post.frontmatter.date}
                {post.frontmatter.canonicalLink && (
                  <span>
                    {` `}
                    (originally published at{` `}
                    <a href={post.frontmatter.canonicalLink}>
                      {post.frontmatter.publishedAt}
                    </a>)
                  </span>
                )}
              </BioLine>
            </div>
          </header>
          <h1
            css={{
              marginTop: 0,
              [presets.Desktop]: {
                marginBottom: rhythm(5 / 4),
              },
            }}
          >
            {this.props.data.markdownRemark.frontmatter.title}
          </h1>
          {post.frontmatter.image &&
            !(post.frontmatter.showImageInArticle === false) && (
              <div
                css={{
                  marginBottom: rhythm(1),
                }}
              >
                <Img sizes={post.frontmatter.image.childImageSharp.sizes} />
                {post.frontmatter.imageAuthor &&
                  post.frontmatter.imageAuthorLink && (
                    <em>
                      Image by{` `}
                      <a href={post.frontmatter.imageAuthorLink}>
                        {post.frontmatter.imageAuthor}
                      </a>
                    </em>
                  )}
              </div>
            )}
          <div
            className="post-body"
            dangerouslySetInnerHTML={{
              __html: this.props.data.markdownRemark.html,
            }}
          />
          <EmailCaptureForm />
        </Container>
        <div
          css={{
            borderTop: `1px solid ${colors.ui.light}`,
            marginTop: rhythm(2),
            [presets.Tablet]: {
              marginTop: rhythm(2),
              paddingBottom: rhythm(1),
              paddingTop: rhythm(1),
            },
            [presets.Desktop]: {
              marginTop: rhythm(3),
              paddingBottom: rhythm(2),
              paddingTop: rhythm(2),
            },
          }}
        >
          <Container>
            <div
              css={{ [presets.Phablet]: { display: `flex`, width: `100%` } }}
            >
              <div
                css={{
                  [presets.Phablet]: {
                    width: `50%`,
                  },
                }}
              >
                {prev && (
                  <Link to={prev.fields.slug} css={prevNextLinkStyles}>
                    <h4 css={prevNextLabelStyles}>Previous</h4>
                    <span
                      css={{
                        [presets.Tablet]: {
                          marginLeft: `-1rem`,
                        },
                      }}
                    >
                      <ArrowBackIcon style={{ verticalAlign: `sub` }} />
                      {prev.frontmatter.title}
                    </span>
                  </Link>
                )}
              </div>
              <div
                css={{
                  textAlign: `right`,
                  marginTop: rhythm(1),
                  [presets.Phablet]: { marginTop: 0, width: `50%` },
                }}
              >
                {next && (
                  <Link to={next.fields.slug} css={prevNextLinkStyles}>
                    <h4 css={prevNextLabelStyles}>Next</h4>
                    <span
                      css={{
                        [presets.Tablet]: {
                          marginRight: `-1rem`,
                        },
                      }}
                    >
                      {next.frontmatter.title}
                      <ArrowForwardIcon style={{ verticalAlign: `sub` }} />
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </Container>
        </div>
      </div>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query TemplateBlogPost($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      excerpt
      timeToRead
      fields {
        slug
      }
      frontmatter {
        title
        excerpt
        date(formatString: "MMMM Do YYYY")
        rawDate: date
        canonicalLink
        publishedAt
        image {
          childImageSharp {
            resize(width: 1500, height: 1500) {
              src
            }
            sizes(maxWidth: 786) {
              ...GatsbyImageSharpSizes
            }
          }
        }
        imageAuthor
        imageAuthorLink
        imageTitle
        showImageInArticle
        author {
          id
          bio
          twitter
          avatar {
            childImageSharp {
              resolutions(
                width: 63
                height: 63
                quality: 75
                traceSVG: {
                  turdSize: 10
                  background: "#f6f2f8"
                  color: "#e0d6eb"
                }
              ) {
                ...GatsbyImageSharpResolutions_tracedSVG
              }
            }
          }
          fields {
            slug
          }
        }
      }
    }
  }
`
