import React from "react"
import Img from "gatsby-image"
import styled from "@emotion/styled"
import numeral from "numeral"

import { mq, gutter, offset, offsetXxl } from "../utils/presets"
import { options, scale } from "../utils/typography"

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

const GridItemImage = styled(Img)`
  &:hover {
    div + img {
      opacity: 1 !important;
      transition: none !important;
    }

    img + picture > img {
      opacity: 0 !important;
    }

    span: {
      opacity: 1 !important;
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
      {edges.images.map((image, index) => (
        <GridItem key={index}>
          <GridItemImage
            fluid={image.node.localFile.childImageSharp.fluid}
            title={`“${image.node.title}” by ${image.node.credit} (via unsplash.com)`}
          />
          <Badge>
            SVG
            {` `}
            {numeral(
              Buffer.byteLength(
                image.node.localFile.childImageSharp.fluid.tracedSVG,
                `utf8`
              )
            ).format()}
            {` `}B
          </Badge>
        </GridItem>
      ))}
    </Grid>
  </OuterContainer>
)

export default ImageGallery
