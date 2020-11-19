import { GatsbyImage as Img } from "gatsby-plugin-image/compat"
// how do comments work?

<Img 
fixed={data.file.childImageSharp.fixed}
 alt="headshot"/>

//still doing ok?

graphql`constrainedWidth: file(relativePath: {eq: "landscape.jpg"}) {
    childImageSharp {
      gatsbyImage(maxWidth: 600, layout: CONSTRAINED) {
        imageData
      }
    }
  }
  `