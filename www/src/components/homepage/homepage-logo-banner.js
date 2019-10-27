/** @jsx jsx */
import { jsx } from "theme-ui"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"
import styled from "@emotion/styled"
import { mediaQueries } from "gatsby-design-tokens"

const Section = styled(`section`)`
  overflow: hidden;
  padding: ${p => p.theme.space[9]} 0;
`

const LogoGroup = styled(`div`)`
  position: relative;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: auto;
  grid-gap: ${p => p.theme.space[6]};
  align-items: center;
  overflow-x: scroll;
  padding-left: ${p => p.theme.space[3]};
  padding-bottom: ${p => p.theme.space[4]};
  ${mediaQueries.xxl} {
    padding-bottom: ${p => p.theme.space[6]};
  }
  &::-webkit-scrollbar {
    display: none;
  }
`

const HomepageLogoBanner = () => {
  const data = useStaticQuery(graphql`
    query {
      allFile(
        filter: {
          extension: { regex: "/(jpg)|(png)|(jpeg)/" }
          relativeDirectory: { eq: "used-by-logos" }
        }
        sort: { fields: publicURL }
      ) {
        edges {
          node {
            base
            childImageSharp {
              fixed(quality: 75, height: 20) {
                ...GatsbyImageSharpFixed_tracedSVG
              }
            }
          }
        }
      }
    }
  `)

  return (
    <Section>
      <h2
        sx={{
          color: `textMuted`,
          fontSize: 2,
          fontWeight: `body`,
          m: 0,
          mb: 4,
        }}
      >
        Trusted by
      </h2>
      <LogoGroup>
        {data.allFile.edges.map(({ node: image }) => (
          <Img
            alt={`${image.base.split(`.`)[0]}`}
            fixed={image.childImageSharp.fixed}
            key={image.base}
          />
        ))}
      </LogoGroup>
    </Section>
  )
}

export default HomepageLogoBanner
