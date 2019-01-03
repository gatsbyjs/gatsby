import React from "react"
import { Helmet } from "react-helmet"
import { Link, graphql } from "gatsby"
import rehypeReact from "rehype-react"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"
import ArrowBackIcon from "react-icons/lib/md/arrow-back"
import Img from "gatsby-image"
import Layout from "../components/layout"
import presets, { colors } from "../utils/presets"
import typography, { rhythm, scale, options } from "../utils/typography"
import Container from "../components/container"
import EmailCaptureForm from "../components/email-capture-form"
import TagsSection from "../components/tags-section"
import HubspotForm from "../components/hubspot-form"
import Pullquote from "../components/shared/pullquote"
import Chart from "../components/chart"

const renderAst = new rehypeReact({
  createElement: React.createElement,
  components: {
    "hubspot-form": HubspotForm,
    "date-chart": Chart,
    pullquote: Pullquote,
  },
}).Compiler

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
    let canonicalLink
    if (post.frontmatter.canonicalLink) {
      canonicalLink = (
        <link rel="canonical" href={post.frontmatter.canonicalLink} />
      )
    }

    return (
      <Layout location={this.props.location}>
        <Container className="post" css={{ paddingBottom: `0` }}>
          <main id={`reach-skip-nav`}>
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

              <meta property="og:description" content={post.excerpt} />
              <meta name="twitter:description" content={post.excerpt} />
              <meta property="og:title" content={post.frontmatter.title} />
              {post.frontmatter.image && (
                <meta
                  property="og:image"
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
              <meta property="og:type" content="article" />
              <meta
                name="article:author"
                content={post.frontmatter.author.id}
              />
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
              {canonicalLink}
            </Helmet>
            <section
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
                <Link
                  to={post.frontmatter.author.fields.slug}
                  css={{
                    "&&": {
                      borderBottom: 0,
                      boxShadow: `none`,
                      "&:hover": {
                        background: `none`,
                      },
                    },
                  }}
                >
                  <Img
                    fixed={post.frontmatter.author.avatar.childImageSharp.fixed}
                    css={{
                      height: rhythm(2.3),
                      width: rhythm(2.3),
                      margin: 0,
                      borderRadius: `100%`,
                      display: `inline-block`,
                      verticalAlign: `middle`,
                    }}
                  />
                </Link>
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
                      color: `${colors.gatsby}`,
                    }}
                  >
                    <span
                      css={{
                        borderBottom: `1px solid ${colors.ui.bright}`,
                        boxShadow: `inset 0 -2px 0 0 ${colors.ui.bright}`,
                        transition: `all ${presets.animation.speedFast} ${
                          presets.animation.curveDefault
                        }`,
                        "&:hover": {
                          background: colors.ui.bright,
                        },
                      }}
                    >
                      {post.frontmatter.author.id}
                    </span>
                  </h4>
                </Link>
                <BioLine>{post.frontmatter.author.bio}</BioLine>
                <BioLine>
                  {post.timeToRead} min read · {post.frontmatter.date}
                  {post.frontmatter.canonicalLink && (
                    <span>
                      {` `}
                      (originally published at
                      {` `}
                      <a href={post.frontmatter.canonicalLink}>
                        {post.frontmatter.publishedAt}
                      </a>
                      )
                    </span>
                  )}
                </BioLine>
              </div>
            </section>
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
                  <Img fluid={post.frontmatter.image.childImageSharp.fluid} />
                  {post.frontmatter.imageAuthor &&
                    post.frontmatter.imageAuthorLink && (
                      <em>
                        Image by
                        {` `}
                        <a href={post.frontmatter.imageAuthorLink}>
                          {post.frontmatter.imageAuthor}
                        </a>
                      </em>
                    )}
                </div>
              )}
            <section className="post-body">
              {renderAst(this.props.data.markdownRemark.htmlAst)}
            </section>
            <TagsSection
              tags={this.props.data.markdownRemark.frontmatter.tags}
            />
            <EmailCaptureForm />
          </main>
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
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      htmlAst
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
        tags
        image {
          childImageSharp {
            resize(width: 1500, height: 1500) {
              src
            }
            fluid(maxWidth: 786) {
              ...GatsbyImageSharpFluid
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
              fixed(
                width: 63
                height: 63
                quality: 75
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
          fields {
            slug
          }
        }
      }
    }
  }
`
