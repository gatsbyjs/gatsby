/** @jsx jsx */
import { jsx } from "theme-ui"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"
import styled from "@emotion/styled"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

import { Name } from "./homepage-section"

const Section = styled(`section`)`
  border-bottom: 1px solid ${p => p.theme.colors.ui.border};
  overflow: hidden;
  padding: ${p => p.theme.space[5]} 0;
  width: 100%;

  ${mediaQueries.xl} {
    margin-top: -1px;
    margin-bottom: -1px;
  }

  ${mediaQueries.xxl} {
    padding: ${p => p.theme.space[7]} 0;
  }
`

const Title = styled(`header`)`
  padding-right: ${p => p.theme.space[6]};
  padding-left: ${p => p.theme.space[6]};
  ${mediaQueries.md} {
    max-width: 30rem;
  }

  ${mediaQueries.lg} {
    margin-left: ${p => p.theme.space[9]};
  }

  ${mediaQueries.xl} {
    padding-right: 5%;
    padding-left: 5%;
  }

  ${mediaQueries.xxl} {
    padding-right: 8%;
    padding-left: 8%;
  }
`

const LogoGroup = styled(`div`)`
  position: relative;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: auto;
  grid-gap: ${p => p.theme.space[8]};
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
        nodes {
          base
          childImageSharp {
            fixed(quality: 75, height: 24) {
              ...GatsbyImageSharpFixed_tracedSVG
            }
          }
        }
      }
    }
  `)

  return (
    <Section>
      <Title>
        <Name>Trusted by</Name>
      </Title>
      <LogoGroup>
        {data.allFile.nodes.map(image => (
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
