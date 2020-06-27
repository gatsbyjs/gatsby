/** @jsx jsx */
import { jsx } from "theme-ui"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

import { Name } from "./homepage-section"

const Section = props => (
  <section
    {...props}
    sx={{
      borderBottom: t => `1px solid ${t.colors.ui.border}`,
      overflow: `hidden`,
      py: 5,
      width: `100%`,

      [mediaQueries.xl]: {
        marginTop: `-1px`,
        marginBottom: `-1px`,
      },

      [mediaQueries.xxl]: {
        py: 7,
      },
    }}
  />
)

const Title = props => (
  <header
    {...props}
    sx={{
      px: 6,

      [mediaQueries.md]: {
        maxWidth: `30rem`,
      },

      [mediaQueries.lg]: {
        ml: 9,
      },

      [mediaQueries.xl]: {
        px: `5%`,
      },

      [mediaQueries.xxl]: {
        px: `8%`,
      },
    }}
  />
)

const LogoGroup = props => (
  <div
    {...props}
    sx={{
      position: `relative`,
      display: `grid`,
      gridAutoFlow: `column`,
      gridAutoColumns: `auto`,
      gridGap: t => t.space[8],
      alignItems: `center`,
      overflowX: `scroll`,
      pl: 3,
      pb: 4,
      [mediaQueries.xxl]: {
        padding: 6,
      },
      "&::-webkit-scrollbar": {
        display: `none`,
      },
    }}
  />
)

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
      <LogoGroup tabIndex={0}>
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
