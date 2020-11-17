import React from "react";
import Img from "gatsby-image";
import { useStaticQuery, graphql } from "gatsby";
export const Hero: React.SFC = ({ children }) => {
    const data = useStaticQuery(graphql`
        {
            file(relativePath: { eq: "banner.jpg" }) {
                childImageSharp {
                    fluid {
                        ...GatsbyImageSharpFluid_withWebp
                    }
                }
            }
        }
    `);
    return (
        <Img
            fluid={data.file.childImageSharp.fluid}
            alt="A panorama of Skara Brae, Orkney"
            style={{
                width: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: -1
            }}
        />
    );
};
export default Hero;