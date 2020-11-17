import React from "react";
import { graphl } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";
<GatsbyImage image={data.file.childImageSharp.gatsbyImageData} alt="headshot" />;
export const query = graphql`{
  allProjectsYaml(sort: {fields: [index], order: DESC}) {
    nodes {
      name
      url
      image {
        childImageSharp {
          gatsbyImageData(placeholder: TRACED_SVG, layout: FLUID)
        }
      }
      technologies
    }
  }
}
`;
