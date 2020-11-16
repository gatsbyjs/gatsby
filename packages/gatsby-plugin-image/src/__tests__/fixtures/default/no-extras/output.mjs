import React from "react";
import { graphl } from "gatsby";
import { GatsbyImage } from "gatsby-image";

/*#__PURE__*/
React.createElement(GatsbyImage, {
  image: data.file.childImageSharp.gatsbyImageData,
  alt: "headshot"
});
export const query = graphql`{
  file(relativePath: {eq: "headers/default.jpg"}) {
    childImageSharp {
      gatsbyImageData(width: 125, height: 125, layout: FIXED)
    }
  }
}
`;
