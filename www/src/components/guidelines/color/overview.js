/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import range from "range"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import { SectionHeading, SectionSubheading } from "../typography"

import Swatch from "./swatch"

import { getA11yLabel, getTextColor } from "../../../utils/guidelines/color"
import { copyColumnGutter, CopyColumn } from "../containers"
import palette from "../../../utils/guidelines/extend-palette-info"
import { Box, Flex } from "theme-ui"

// Color swatches
const swatchWidth = 40
const swatchStyle = {
  flexGrow: 0,
  flexShrink: 0,
  height: swatchWidth,
  my: 1,
  mr: 2,
  position: `relative`,
  textAlign: `center`,
  width: swatchWidth,
}
const colorNumber = {
  ...swatchStyle,
  color: `grey.50`,
  fontSize: 1,
  transform: `rotate(-45deg)`,
}

const colores = node => {
  let colors = []

  Object.keys(palette[node].colors)
    .sort((a, b) => b - a)
    .forEach((color, index) => {
      const c = palette[node].colors[color]

      colors.push(
        <Swatch
          key={`${index}-${c.hex}`}
          color={c}
          contrast={c.contrast}
          a11yLabel={getA11yLabel(c.a11y, true)}
          textColor={getTextColor(c.contrast)}
          name={c.name}
          isBase={c.base}
          swatchStyle={swatchStyle}
        />
      )
    })

  return colors
}

const Palette = ({ color, handler }) => {
  const node = Object.keys(palette)
    .filter(group => group === color)
    .map(node => node)
  const name = palette[node].name

  return (
    <Box
      key={node}
      sx={{
        display: `flex`,
        flexDirection: `column`,
        mb: [4, null, null, 0],
        [mediaQueries.lg]: {
          flexDirection: `row`,
          alignItems: `center`,
        },
      }}
    >
      <Box
        sx={{
          [mediaQueries.lg]: {
            textAlign: `right`,
            width: `8rem`,
            mr: copyColumnGutter,
          },
        }}
      >
        <Box
          as="button"
          onClick={e => handler(e, node)}
          sx={{
            p: 0,
            background: `transparent`,
            bg: `none`,
            border: 0,
            cursor: `pointer`,
            WebkitAppearance: `none`,
            "&&:hover span, &&:focus span": {
              borderColor: `link.hoverBorder`,
              color: `link.hoverColor`,
            },
          }}
        >
          <SectionSubheading
            as="span"
            fontFamily="heading"
            fontWeight="body"
            mt={0}
            mb={0}
            fontSize={4}
            color="link.color"
            sx={{ borderColor: `link.border`, borderBottom: 1 }}
            title={`Open “${name}” color modal`}
          >
            {name}
          </SectionSubheading>
        </Box>
      </Box>
      <Flex
        sx={{
          flexWrap: `wrap`,
        }}
      >
        <Flex
          sx={{
            flexDirection: `row`,
            alignItems: `stretch`,
          }}
        >
          {range.range(0, 5).map(i => colores(node)[i])}
        </Flex>
        <Flex
          sx={{
            flexDirection: `row`,
            alignItems: `stretch`,
          }}
        >
          {range.range(5, 10).map(i => colores(node)[i])}
        </Flex>
      </Flex>
    </Box>
  )
}

const Overview = ({ handler }) => (
  <React.Fragment>
    <Flex>
      <CopyColumn />
      <Box
        sx={{
          display: `none`,
          [mediaQueries.lg]: {
            display: `flex`,
            alignItems: `flex-end`,
          },
        }}
      >
        <div sx={colorNumber}>90</div>
        <div sx={colorNumber}>80</div>
        <div sx={colorNumber}>70</div>
        <div sx={colorNumber}>60</div>
        <div sx={colorNumber}>50</div>
        <div sx={colorNumber}>40</div>
        <div sx={colorNumber}>30</div>
        <div sx={colorNumber}>20</div>
        <div sx={colorNumber}>10</div>
        <div sx={colorNumber}>5</div>
      </Box>
    </Flex>
    <Box
      sx={{
        [mediaQueries.lg]: {
          display: `flex`,
        },
      }}
    >
      <SectionHeading
        sx={{
          [mediaQueries.lg]: {
            width: `12rem`,
          },
        }}
      >
        Primary
      </SectionHeading>
      <Box>
        <Palette color="purple" handler={handler} />
        <Palette color="orange" handler={handler} />
      </Box>
    </Box>
    <Box
      sx={{
        [mediaQueries.lg]: {
          display: `flex`,
        },
      }}
    >
      <SectionHeading
        sx={{
          [mediaQueries.lg]: {
            width: `12rem`,
          },
        }}
      >
        Secondary
      </SectionHeading>
      <Box>
        <Palette color="magenta" handler={handler} />
        <Palette color="blue" handler={handler} />
        <Palette color="teal" handler={handler} />
        <Palette color="yellow" handler={handler} />
        <Palette color="red" handler={handler} />
        <Palette color="green" handler={handler} />
      </Box>
    </Box>
    <Box
      sx={{
        [mediaQueries.lg]: {
          display: `flex`,
        },
      }}
    >
      <SectionHeading
        sx={{
          [mediaQueries.lg]: {
            width: `12rem`,
          },
        }}
      >
        Neutral
      </SectionHeading>
      <Box>
        <Palette color="grey" handler={handler} />
        {/* <Palette color="blackFade" handler={handler} />
        <Palette color="whiteFade" handler={handler} /> */}
      </Box>
    </Box>
  </React.Fragment>
)

export default Overview
