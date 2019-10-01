/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"
import styled from "@emotion/styled"
import { mediaQueries } from "gatsby-design-tokens"

import { Name } from "./homepage-section"

const Section = styled(`section`)`
  overflow: hidden;
  padding: ${p => p.theme.space[5]} 0;
  width: 100%;
  border-bottom: 1px solid ${p => p.theme.colors.ui.border};

  ${mediaQueries.xl} {
    margin: -1px 0;
    padding: ${p => p.theme.space[5]} 0;
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
  padding-left: $ ${p => p.theme.space[3]};
  padding-bottom: $ ${p => p.theme.space[1]};
  ${mediaQueries.xxl} {
    padding-bottom: ${p => p.theme.space[3]};
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
              fixed(quality: 75, height: 36) {
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
      <Title>
        <Name>Trusted by</Name>
      </Title>
      <LogoGroup>
        {data.allFile.edges.map(({ node: image }) => (
          <Img
            alt={`${image.base.split(`.`)[0]}`}
            fixed={image.childImageSharp.fixed}
            key={image.base}
            style={{ opacity: 0.5 }}
          />
        ))}
      </LogoGroup>
    </Section>
  )
}

export default HomepageLogoBanner
