import React from "react"
import { Helmet } from "react-helmet"
import { Link, graphql } from "gatsby"
import rehypeReact from "rehype-react"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"
import ArrowBackIcon from "react-icons/lib/md/arrow-back"
import Img from "gatsby-image"

import Layout from "../components/layout"
import {
  colors,
  space,
  transition,
  breakpoints,
  lineHeights,
  fontSizes,
  fonts,
} from "../utils/presets"
import { rhythm } from "../utils/typography"
import Container from "../components/container"
import EmailCaptureForm from "../components/email-capture-form"
import TagsSection from "../components/tags-section"
import HubspotForm from "../components/hubspot-form"
import Pullquote from "../components/shared/pullquote"
import Chart from "../components/chart"
import Avatar from "../components/avatar"
import FooterLinks from "../components/shared/footer-links"

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
        borderBottom: 0,
        fontFamily: fonts.header,
        fontWeight: `bold`,
        color: colors.gatsby,
      },
    }
    const prevNextLabelStyles = {
      marginTop: 0,
      marginBottom: 0,
      color: colors.gray.calm,
      fontWeight: `normal`,
      lineHeight: lineHeights.solid,
    }
    const BioLine = ({ children }) => (
      <p
        css={{
          lineHeight: lineHeights.dense,
          fontFamily: fonts.header,
          margin: 0,
          color: colors.gray.calm,
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
        <Container>
          {
            // todo
            // - settle on `docSearch-content` as selector to identify
            //   Algolia DocSearch content
            // - make use of components/docsearch-content in place of <main>
            //
            // `post` and `post-body` are only in use as selectors in the
            // docsearch config for gatsbyjs.org for individual blog posts:
            // https://github.com/algolia/docsearch-configs/blob/89706210b62e2f384e52ca1b104f92bc0e225fff/configs/gatsbyjs.json#L71-L76
          }
          <main id={`reach-skip-nav`} className="post docSearch-content">
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
                marginBottom: space[5],
                [breakpoints.md]: {
                  marginTop: space[3],
                  marginBottom: space[9],
                },
              }}
            >
              <div css={{ flex: `0 0 auto` }}>
                <Link
                  to={post.frontmatter.author.fields.slug}
                  css={{ "&&": { borderBottom: 0 } }}
                >
                  <Avatar
                    image={post.frontmatter.author.avatar.childImageSharp.fixed}
                  />
                </Link>
              </div>
              <div css={{ flex: `1 1 auto` }}>
                <Link to={post.frontmatter.author.fields.slug}>
                  <h4
                    css={{
                      fontSize: fontSizes[3],
                      marginBottom: space[1],
                      color: `${colors.gatsby}`,
                    }}
                  >
                    <span
                      css={{
                        borderBottom: `1px solid ${colors.ui.bright}`,
                        transition: `all ${transition.speed.fast} ${
                          transition.curve.default
                        }`,
                        "&:hover": { background: colors.ui.bright },
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
                        {this.props.data.markdownRemark.fields.publishedAt}
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
                [breakpoints.lg]: { marginBottom: rhythm(5 / 4) },
              }}
            >
              {this.props.data.markdownRemark.frontmatter.title}
            </h1>
            {post.frontmatter.image &&
              !(post.frontmatter.showImageInArticle === false) && (
                <div css={{ marginBottom: space[5] }}>
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
            marginTop: space[9],
            [breakpoints.md]: {
              paddingBottom: space[5],
              paddingTop: space[5],
            },
            [breakpoints.lg]: {
              paddingBottom: space[9],
              paddingTop: space[9],
            },
          }}
        >
          <Container>
            <div css={{ [breakpoints.sm]: { display: `flex`, width: `100%` } }}>
              <div css={{ [breakpoints.sm]: { width: `50%` } }}>
                {prev && (
                  <Link to={prev.fields.slug} css={prevNextLinkStyles}>
                    <h4 css={prevNextLabelStyles}>Previous</h4>
                    <span
                      css={{
                        [breakpoints.md]: {
                          marginLeft: `-${space[4]}`,
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
                  marginTop: space[5],
                  [breakpoints.sm]: { marginTop: 0, width: `50%` },
                }}
              >
                {next && (
                  <Link to={next.fields.slug} css={prevNextLinkStyles}>
                    <h4 css={prevNextLabelStyles}>Next</h4>
                    <span
                      css={{
                        [breakpoints.md]: {
                          marginRight: `-${space[4]}`,
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
          <FooterLinks />
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
        publishedAt
      }
      frontmatter {
        title
        excerpt
        date(formatString: "MMMM Do YYYY")
        rawDate: date
        canonicalLink
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
                width: 64
                height: 64
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
