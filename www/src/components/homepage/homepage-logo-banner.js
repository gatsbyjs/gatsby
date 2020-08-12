/** @jsx jsx */
import { jsx } from "theme-ui"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

import { Name } from "./homepage-section"

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
    <section
      sx={{
        borderBottom: 1,
        borderColor: `ui.border`,
        overflow: `hidden`,
        py: [5, null, null, null, null, null, 7],
        my: [null, null, null, null, null, `-1px`],
        width: `100%`,
      }}
    >
      <header
        sx={{
          px: [6, null, null, null, null, `5%`, `8%`],
          maxWidth: [null, null, null, `30rem`],
          ml: [null, null, null, null, 9],
        }}
      >
        <Name>Trusted by</Name>
      </header>
      <div
        sx={{
          position: `relative`,
          display: `grid`,
          gridAutoFlow: `column`,
          gridAutoColumns: `auto`,
          gridGap: t => t.space[8],
          alignItems: `center`,
          overflowX: `scroll`,
          pl: 3,
          pb: [4, null, null, null, null, null, 6],
          "&::-webkit-scrollbar": {
            display: `none`,
          },
        }}
        tabIndex={0}
      >
        {data.allFile.nodes.map(image => (
          <Img
            alt={`${image.base.split(`.`)[0]}`}
            fixed={image.childImageSharp.fixed}
            key={image.base}
          />
        ))}
      </div>
    </section>
  )
}

export default HomepageLogoBanner
