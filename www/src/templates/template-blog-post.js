import React from "react"
import { Helmet } from "react-helmet"
import { Link, graphql } from "gatsby"
import Img from "gatsby-image"
import { MDXRenderer } from "gatsby-plugin-mdx"

import Layout from "../components/layout"
import {
  colors,
  space,
  transition,
  mediaQueries,
  lineHeights,
  fontSizes,
  fonts,
} from "../utils/presets"
import { rhythm } from "../utils/typography"
import Container from "../components/container"
import EmailCaptureForm from "../components/email-capture-form"
import TagsSection from "../components/tags-section"
import Avatar from "../components/avatar"
import PrevAndNext from "../components/prev-and-next"
import FooterLinks from "../components/shared/footer-links"

class BlogPostTemplate extends React.Component {
  render() {
    const {
      pageContext: { prev, next },
      data: { mdx: post },
      location: { href },
    } = this.props
    const BioLine = ({ children }) => (
      <p
        css={{
          lineHeight: lineHeights.dense,
          fontFamily: fonts.header,
          margin: 0,
          color: colors.text.secondary,
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
              css={{
                display: `flex`,
                marginBottom: space[5],
                [mediaQueries.md]: {
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
                      color: colors.link.color,
                    }}
                  >
                    <span
                      css={{
                        borderBottom: `1px solid ${colors.link.border}`,
                        transition: `all ${transition.speed.fast} ${
                          transition.curve.default
                        }`,
                        "&:hover": { borderColor: colors.link.hoverBorder },
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
              css={{
                marginTop: 0,
                [mediaQueries.lg]: { marginBottom: rhythm(5 / 4) },
              }}
            >
              {post.frontmatter.title}
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
              <MDXRenderer>{post.body}</MDXRenderer>
            </section>
            <TagsSection tags={post.frontmatter.tags} />
            <EmailCaptureForm />
          </main>
        </Container>
        <div
          css={{
            borderTop: `1px solid ${colors.ui.border.subtle}`,
            marginTop: space[9],
            [mediaQueries.md]: {
              paddingTop: space[5],
            },
            [mediaQueries.lg]: {
              paddingTop: space[7],
            },
          }}
        >
          <Container>
            <PrevAndNext
              prev={
                prev && {
                  title: prev.frontmatter.title,
                  link: prev.fields.slug,
                }
              }
              next={
                next && {
                  title: next.frontmatter.title,
                  link: next.fields.slug,
                }
              }
            />
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
