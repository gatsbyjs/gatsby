import React from "react"

import Container from "../components/container"
import { rhythm, scale } from "../utils/typography"

const ContributorPageTemplate = React.createClass({
  render() {
    const contributor = this.props.data.authorYaml
    return (
      <div>
        <Container>
          <div css={{ display: `flex` }}>
            <div
              css={{
                flex: `0 0 auto`,
                marginRight: `1rem`,
              }}
            >
              <img
                src={
                  contributor.avatar.childImageSharp.responsiveResolution.src
                }
                srcSet={
                  contributor.avatar.childImageSharp.responsiveResolution.srcSet
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
            <div>
              <h1
                css={{
                  marginTop: 0,
                }}
              >
                {contributor.id}
              </h1>
              <p>
                {contributor.bio}
              </p>
              <a href={`https://twitter.com/${contributor.twitter}`}>
                {contributor.twitter}
              </a>
            </div>
          </div>
        </Container>
      </div>
    )
  },
})

export default ContributorPageTemplate

export const pageQuery = graphql`
  query TemplateContributorPage($slug: String!) {
    authorYaml(fields: { slug: { eq: $slug } }) {
      id
      bio
      twitter
      avatar {
        childImageSharp {
          responsiveResolution(width: 63, height: 63, quality: 75) {
            src
            srcSet
          }
        }
      }
      fields {
        slug
      }
    }
  }
`
