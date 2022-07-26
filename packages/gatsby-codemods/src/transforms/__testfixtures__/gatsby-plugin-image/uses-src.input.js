import Img from "gatsby-image"

<Img
              key={nextSite.slug}
              sx={styles.prevNextImage}
              backgroundColor
              fixed={{
                srcSet: ``,
                src:
                  nextSite.showcaseSiteFields.screenshot.localFile
                    .childImageSharp.resize.src,
                width: 100,
                height: 100,
              }}
              imgStyle={{
                margin: 0,
              }}
              alt=""
            />