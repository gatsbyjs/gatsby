/** @jsx jsx */
import { useEffect } from "react"
import { jsx } from "theme-ui"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"
import styled from "@emotion/styled"
import {
  breakpoints,
  mediaQueries,
} from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

import { Name } from "./homepage-section"
import {
  HorizontalScrollerContent,
  HorizontalScrollerItem,
} from "../shared/horizontal-scroller"

import { SCROLLER_CLASSNAME } from "../../utils/scrollers-observer"

const HorizontalScrollerContentAsDiv = HorizontalScrollerContent.withComponent(
  `div`
)

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

const Logo = styled(`div`)`
  padding-left: ${p => p.theme.space[3]};
  padding-right: ${p => p.theme.space[3]};
  :focus,
  :hover {
    z-index: 1;
  }
`

const LogoScrollable = styled(HorizontalScrollerItem.withComponent(Logo))`
  width: auto;
  margin: auto;
  box-shadow: none;
`

const HomepageLogoBanner = () => {
  let desktopMediaQuery = false
  let desktopViewport = false

  const updateViewPortState = () => {
    desktopViewport = desktopMediaQuery.matches
  }

  useEffect(() => {
    desktopMediaQuery = window.matchMedia(`(min-width: ${breakpoints[3]}`)
    desktopMediaQuery.addListener(updateViewPortState)
    return () => {
      desktopMediaQuery.addListener(updateViewPortState)
    }
  }, [])

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
      {desktopViewport ? (
        <LogoGroup className={SCROLLER_CLASSNAME}>
          <div tabIndex={0}>
            {data.allFile.nodes.map(image => (
              <Logo key={image.base}>
                <Img
                  alt={`${image.base.split(`.`)[0]}`}
                  fixed={image.childImageSharp.fixed}
                />
              </Logo>
            ))}
          </div>
        </LogoGroup>
      ) : (
        <LogoGroup className={SCROLLER_CLASSNAME}>
          <HorizontalScrollerContentAsDiv tabIndex={0}>
            {data.allFile.nodes.map(image => (
              <LogoScrollable key={image.base}>
                <Img
                  alt={`${image.base.split(`.`)[0]}`}
                  fixed={image.childImageSharp.fixed}
                />
              </LogoScrollable>
            ))}
          </HorizontalScrollerContentAsDiv>
        </LogoGroup>
      )}
    </Section>
  )
}

export default HomepageLogoBanner
