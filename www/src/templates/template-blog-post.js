/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { Helmet } from "react-helmet"
import { Link, graphql } from "gatsby"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"
import ArrowBackIcon from "react-icons/lib/md/arrow-back"
import Img from "gatsby-image"
import { MDXRenderer } from "gatsby-plugin-mdx"

import Layout from "../components/layout"
import { mediaQueries } from "../gatsby-plugin-theme-ui"
import Container from "../components/container"
import EmailCaptureForm from "../components/email-capture-form"
import TagsSection from "../components/tags-section"
import Avatar from "../components/avatar"
import FooterLinks from "../components/shared/footer-links"

class BlogPostTemplate extends React.Component {
  render() {
    const {
      pageContext: { prev, next },
      data: { mdx: post },
      location: { href },
    } = this.props
    const prevNextLinkStyles = {
      "&&": {
        borderBottom: 0,
        color: `gatsby`,
        fontFamily: `header`,
        fontSize: 3,
        fontWeight: `bold`,
        lineHeight: `dense`,
      },
    }
    const prevNextLabelStyles = {
      color: `text.secondary`,
      fontSize: 2,
      fontWeight: `normal`,
      mb: 2,
      mt: 0,
    }
    const BioLine = ({ children }) => (
      <p
        sx={{
          color: `text.secondary`,
          fontFamily: `header`,
          lineHeight: `dense`,
          m: 0,
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
              <meta property="og:url" content={href} />
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
              sx={{
                display: `flex`,
                mb: 5,
                [mediaQueries.md]: {
                  mt: 3,
                  mb: 9,
                  [mediaQueries.lg]: {
                    ml: `-8em`,
                  },
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
                    sx={{
                      fontSize: 3,
                      mb: 1,
                      color: `link.color`,
                    }}
                  >
                    <span
                      sx={{
                        borderBottom: t => `1px solid ${t.colors.link.border}`,
                        transition: t =>
                          `all ${t.transition.speed.fast} ${
                            t.transition.curve.default
                          }`,
                        "&:hover": { borderColor: `link.hoverBorder` },
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
                        {post.fields.publishedAt}
                      </a>
                      )
                    </span>
                  )}
                </BioLine>
              </div>
            </section>
            <h1
              sx={{
                marginTop: 0,
                // fontWeight: `600`,
                // fontStyle: `italic`,
                [mediaQueries.lg]: {
                  mx: `-8rem`,
                  fontSize: `calc(10px + 2vh + 2vw)`,
                  letterSpacing: `tight`,
                  lineHeight: `dense`,
                  mb: 12,
                },
              }}
            >
              {post.frontmatter.title}
            </h1>
            {post.frontmatter.image &&
              !(post.frontmatter.showImageInArticle === false) && (
                <div sx={{ mb: 5 }}>
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
              <MDXRenderer>{post.body}</MDXRenderer>
            </section>
            <TagsSection tags={post.frontmatter.tags} />
            <EmailCaptureForm />
          </main>
        </Container>
        <div
          sx={{
            borderTop: t => `1px solid ${t.colors.ui.border.subtle}`,
            mt: 9,
            [mediaQueries.md]: { pt: 5 },
            [mediaQueries.lg]: { pt: 7 },
          }}
        >
          <Container>
            <div
              css={{
                [mediaQueries.sm]: { display: `flex`, width: `100%` },
              }}
            >
              <div css={{ [mediaQueries.sm]: { width: `50%` } }}>
                {prev && (
                  <Link to={prev.fields.slug} sx={prevNextLinkStyles}>
                    <h4 sx={prevNextLabelStyles}>Previous</h4>
                    <span
                      sx={{
                        [mediaQueries.md]: {
                          marginLeft: t => `-${t.space[4]}`,
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
                sx={{
                  textAlign: `right`,
                  mt: 5,
                  [mediaQueries.sm]: { mt: 0, width: `50%` },
                }}
              >
                {next && (
                  <Link to={next.fields.slug} sx={prevNextLinkStyles}>
                    <h4 sx={prevNextLabelStyles}>Next</h4>
                    <span
                      sx={{
                        [mediaQueries.md]: {
                          marginRight: t => `-${t.space[4]}`,
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
    mdx(fields: { slug: { eq: $slug } }) {
      body
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
