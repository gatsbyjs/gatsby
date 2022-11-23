import { GatsbyImage } from "gatsby-plugin-image";
<GatsbyImage
  image={image.gatsbyImageData}
  aria-hidden={image.description ? undefined : true}
  alt={image.description} />