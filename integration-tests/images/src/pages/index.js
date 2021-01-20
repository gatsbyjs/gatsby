import React from "react"
import { StaticImage, GatsbyImage, getImage } from "gatsby-plugin-image"
import { graphql } from "gatsby"

const IndexPage = ({ data }) => {
  return (
    <main>
      <section data-test-id="constrained-square">
        <StaticImage
          src="../images/sighisoara.jpg"
          formats={["auto", "webp", "avif"]}
          width={500}
          height={500}
        />
      </section>
      <section data-test-id="forcePNG">
        <StaticImage
          src="../images/sighisoara.jpg"
          formats={["auto", "png"]}
          width={500}
          height={500}
        />
      </section>
      <section data-test-id="aspectRatio">
        <StaticImage
          src="../images/sighisoara.jpg"
          formats={["auto", "webp", "avif"]}
          width={500}
          aspectRatio={9 / 16}
        />
      </section>
      <section data-test-id="fullWidth-aspectRatio">
        <StaticImage
          src="../images/sighisoara.jpg"
          formats={["auto", "webp", "avif"]}
          aspectRatio={10 / 1}
          layout="fullWidth"
        />
      </section>
      <section data-test-id="fixed-aspectRatio">
        <StaticImage
          src="../images/sighisoara.jpg"
          formats={["auto", "webp", "avif"]}
          width={500}
          aspectRatio={9 / 16}
          layout="fixed"
        />
      </section>
      <section data-test-id="fixed">
        <StaticImage
          src="../images/sighisoara.jpg"
          formats={["auto", "webp", "avif"]}
          width={1000}
          layout="fixed"
        />
      </section>
      <section data-test-id="fixed-square">
        <StaticImage
          src="../images/sighisoara.jpg"
          formats={["auto", "webp", "avif"]}
          width={300}
          height={300}
          layout="fixed"
        />
      </section>
      <section data-test-id="constrained">
        <StaticImage
          src="../images/sighisoara.jpg"
          formats={["auto", "webp", "avif"]}
          width={1000}
        />
      </section>

      <section data-test-id="no-jpg">
        <p>No jog</p>
        <StaticImage
          src="../images/sighisoara.jpg"
          formats={["webp"]}
          width={1000}
        />
        <p>No jog</p>
      </section>

      <section data-test-id="fullwidth">
        <GatsbyImage image={getImage(data.file)} />
      </section>

      <section data-test-id="fullwidth-bp">
        <GatsbyImage
          image={getImage(data.file)}
          breakpoints={[200, 400, 800, 1600]}
        />
      </section>
    </main>
  )
}

export default IndexPage

export const query = graphql`
  query MyQuery {
    file(relativePath: { eq: "sighisoara.jpg" }) {
      childImageSharp {
        gatsbyImageData(layout: FULL_WIDTH, formats: [AUTO, WEBP, AVIF])
      }
    }
  }
`
