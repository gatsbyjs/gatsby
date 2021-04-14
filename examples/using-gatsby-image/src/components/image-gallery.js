import React from "react"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import styled from "@emotion/styled"

import { mq, gutter, offset, offsetXxl } from "../utils/presets"
import { options, scale } from "../utils/typography"

const Buffer = require("buffer/").Buffer

const OuterContainer = styled(`div`)`
  background: #fff;

  ${mq.tablet} {
    margin: 0;
    margin-left: calc(-${offset} - ${gutter.tablet});
    padding: 6.25rem;
    padding-right: 0;
  }

  ${mq.desktop} {
    margin-left: calc(-${offset} - ${gutter.desktop});
  }

  ${mq.xl} {
    margin-right: -${gutter.desktop};
  }

  ${mq.xxl} {
    margin-left: calc(-${offsetXxl} - ${gutter.desktop});
  }
`

const Grid = styled(`div`)`
  column-count: 1;
  column-gap: ${gutter.default};

  ${mq.mobile} {
    column-count: 2;
  }

  ${mq.tablet} {
    column-count: 3;
  }

  ${mq.xl} {
    column-gap: ${gutter.tablet};
  }
`

const GridItem = styled(`div`)`
  break-inside: avoid;
  position: relative;
  margin-bottom: ${gutter.default};

  ${mq.xl} {
    margin-bottom: ${gutter.tablet};
  }
`

const GridItemImage = styled(GatsbyImage)`
  &:hover {
    [data-placeholder-image] {
      opacity: 1 !important;
      transition: none !important;
    }

    [data-main-image] {
      opacity: 0 !important;
      transition: none !important;
    }
  }
`

const Badge = styled(`span`)`
  background: #fff;
  bottom: 0.625rem;
  border-radius: 0.125rem;
  color: ${options.bodyColor};
  font-family: ${options.monospaceFontFamily.join(`,`)};
  font-size: ${scale(-2).fontSize};
  line-height: 1;
  padding: 0.25rem;
  pointer-events: none;
  position: absolute;
  opacity: 0.5;
  right: 0.625rem;
`

const ImageGallery = edges => (
  <OuterContainer>
    <Grid>
      {edges.images.map(image => {
        const img = getImage(image.node.localFile)
        console.log({ image })
        const fallbackString =
          img?.placeholder?.fallback ?? img?.backgroundColor
        const byteLength = Buffer.byteLength(fallbackString, `utf8`)
        return (
          <GridItem key={fallbackString}>
            <GridItemImage
              image={img}
              alt={`“${image.node.title}” by ${image.node.credit} (via unsplash.com)`}
            />

            {byteLength > 1000 ? (
              <Badge>Placeholder {(byteLength / 1000).toFixed(1)}kB</Badge>
            ) : (
              <Badge>Placeholder {byteLength.toFixed(1)}B</Badge>
            )}
          </GridItem>
        )
      })}
    </Grid>
  </OuterContainer>
)

export default ImageGallery
