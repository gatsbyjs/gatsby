import { GatsbyImage } from "gatsby-plugin-image";

<GatsbyImage
  image={{
    srcSet: ``,
    src:
      nextSite.showcaseSiteFields.screenshot.localFile
        .childImageSharp.resize.src,
    width: 100,
    height: 100,
  }}
  key={nextSite.slug}
  sx={styles.prevNextImage}
  backgroundColor
  imgStyle={{
    margin: 0,
  }}
  alt="" />