import React from "react";
import { graphl } from "gatsby";
import { GatsbyImage } from "gatsby-image";

/*#__PURE__*/
React.createElement(GatsbyImage, {
  image: data.file.childImageSharp.gatsbyImageData,
  alt: "headshot"
});
export const query = graphql`{
  file(relativePath: {eq: "headers/headshot.jpg"}) {
    childImageSharp {
      gatsbyImageData(layout: FLUID)
    }
  }
  banner: file(relativePath: {eq: "headers/default.jpg"}) {
    childImageSharp {
      gatsbyImageData(placeholder: TRACED_SVG, layout: CONSTRAINED)
    }
  }
}
`;
