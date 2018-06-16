import React from "react"
import Helmet from "react-helmet"
import { Link } from "gatsby"
import { OutboundLink } from "gatsby-plugin-google-analytics"

import Layout from "../components/layout"
import presets, { colors } from "../utils/presets"
import typography, { rhythm, scale, options } from "../utils/typography"
import Container from "../components/container"

class StarterTemplate extends React.Component {
  render() {

    return (
      <Layout location={this.props.location}>
        <Container className="post" css={{ paddingBottom: `0 !important` }}>
          {/* Add long list of social meta tags */}
          <Helmet>
            <title>{post.frontmatter.title}</title>
            {/* <link
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
            {canonicalLink} */}
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
              img
            </div>
            <div
              css={{
                flex: `1 1 auto`,
                marginLeft: rhythm(1 / 2),
              }}
            >
              Link
              BioLine
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
            h1
          </h1>
          img
          <div
            className="post-body"
            dangerouslySetInnerHTML={{
              __html: this.props.data.markdownRemark.html,
            }}
          />
          TagsSection
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
                previous
              </div>
              <div
                css={{
                  textAlign: `right`,
                  marginTop: rhythm(1),
                  [presets.Phablet]: { marginTop: 0, width: `50%` },
                }}
              >
                next
              </div>
            </div>
          </Container>
        </div>
      </Layout>
    )
  }
}


export default StarterTemplate

export const pageQuery = graphql`
  query TemplateStarter($slug: String!) {
    markdownRemark(fields: { 
        starterShowcase: {
          slug: { eq: $slug } 
        }
      }) {
        frontmatter {
          date
          demo
          repo
          tags
          features
          description
        }
        fields {
          starterShowcase {
            stub
            slug
            date
            gatsbyDependencies
            lastUpdated
            description
            githubFullName
            owner {
              avatar_url
            }
            githubData {
              repoMetadata {
                full_name
                name
                owner {
                  login
                }
              }
            }
            stars
          }
        }
    }
  }
`
