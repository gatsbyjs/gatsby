import React, { Component } from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import Helmet from "react-helmet"
import typography, { rhythm, scale } from "../utils/typography"
import Img from "gatsby-image"
import CommunityHeader from "../views/community/community-header"
import presets, { colors } from "../utils/presets"
import GithubIcon from "react-icons/lib/go/mark-github"

//A variant of the Creators Header Design here with Breadcrumb of Creators > PEOPLE (Whatever) > Creator so clickable to go back to creators

class CreatorTemplate extends Component {
  render() {
    const { data } = this.props
    const creator = data.creatorsYaml
    return (
      <Layout location={location}>
        <Helmet>
          <title>{creator.name}</title>
        </Helmet>
        <CommunityHeader />
        <main
          role="main"
          css={{
            padding: rhythm(3 / 4),
            display: `flex`,
            justifyContent: `center`,
            fontFamily: typography.options.headerFontFamily.join(`,`),
          }}
        >
          <div
            css={{
              margin: rhythm(3 / 4),
              flex: `1`,
              maxWidth: `720`,
            }}
          >
            <Img
              css={{
                minWidth: `100%`,
              }}
              alt={`${creator.name}`}
              fluid={creator.image.childImageSharp.fluid}
            />
          </div>
          <div
            css={{
              display: `flex`,
              flexDirection: `column`,
              margin: rhythm(3 / 4),
              flex: `1`,
              maxWidth: `720`,
            }}
          >
            {creator.for_hire || creator.hiring ? (
              <span css={[styles.badge]}>
                {creator.for_hire ? `Open For Work` : `Hiring`}
              </span>
            ) : null}
            <span
              css={{
                display: `flex`,
                borderBottom: `2px solid black`,
                alignItems: `center`,
              }}
            >
              <h1
                css={{
                  textTransform: `uppercase`,
                  margin: `0`,
                }}
              >
                {creator.name}
              </h1>
              {creator.github && (
                <GithubIcon
                  css={{
                    marginLeft: `auto`,
                    // color: colors.gray.bright,
                  }}
                />
              )}
            </span>
            <span
              css={{
                borderBottom: `2px solid black`,
                padding: `${rhythm()} 0`,
              }}
            >
              <p
                css={{
                  margin: `0`,
                }}
              >
                {creator.description}
              </p>
            </span>
            <span
              css={{
                borderBottom: `2px solid black`,
                padding: `${rhythm(3 / 4)} 0`,
                display: `flex`,
              }}
            >
              <p
                css={{
                  margin: `0`,
                  textDecoration: `underline`,
                  fontWeight: `600`,
                  width: `150`,
                }}
              >
                Get in touch
              </p>
              <a
                href={creator.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {creator.website}
              </a>
            </span>
            <span
              css={{
                borderBottom: `2px solid black`,
                padding: `${rhythm(3 / 4)} 0`,

                display: `flex`,
              }}
            >
              <p
                css={{
                  margin: `0`,
                  textDecoration: `underline`,
                  fontWeight: `600`,

                  width: `150`,
                }}
              >
                From
              </p>
              <p
                css={{
                  margin: `0`,
                }}
              >
                {creator.location}
              </p>
            </span>
            {creator.portfolio && (
              <span
                css={{
                  borderBottom: `2px solid black`,
                  padding: `${rhythm(3 / 4)} 0`,
                }}
              >
                <p
                  css={{
                    margin: `0`,
                    textDecoration: `underline`,
                    fontWeight: `600`,
                    width: `150`,
                  }}
                >
                  Worked On
                </p>
                {/* We can probably map the sent websites on sites.yml as worked on and just parse that here */}
                {/* this should go to their website on the Gatsby showcase, so we can actually just parse the screenshot available there and show it as a thumbnail? */}
                <div
                  css={{
                    display: `flex`,
                    flexDirection: `column`,
                    alignItems: `flex-start`,
                  }}
                >
                  {creator.portfolio.map((work, i) => <a key={i}>{work}</a>)}
                </div>
              </span>
            )}
          </div>
        </main>
      </Layout>
    )
  }
}

export default CreatorTemplate

export const pageQuery = graphql`
  query($slug: String!) {
    creatorsYaml(fields: { slug: { eq: $slug } }) {
      name
      description
      location
      website
      github
      image {
        childImageSharp {
          fluid {
            ...GatsbyImageSharpFluid
          }
        }
      }
      for_hire
      hiring
      portfolio
      fields {
        slug
      }
    }
  }
`

const styles = {
  badge: {
    ...scale(-1 / 3),
    padding: `${rhythm(1 / 4)} 1.6rem`,
    margin: `${rhythm(3 / 4)} 0`,
    borderRadius: `20px`,
    alignSelf: `flex-start`,
    color: `white`,
    background: colors.gatsby,
    textTransform: `uppercase`,
  },
}
