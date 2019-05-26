import React from "react"
import { capitalize } from "lodash-es"
import range from "range"

import { SectionHeading, SectionSubheading } from "../typography"

import Swatch from "./swatch"

import {
  getAccessibilityLabel,
  getTextColor,
} from "../../../utils/guidelines/color"
import palette from "../../../utils/guidelines/extend-palette-info"
import { Box, Flex, Text } from "../system"
import theme from "../../../utils/guidelines/theme"

const bpMargin = theme.space[7]
const bpWidth = 400

// Color swatches
const swatchWidth = 40
const swatchStyle = {
  flexGrow: 0,
  flexShrink: 0,
  width: swatchWidth,
  height: swatchWidth,
  marginRight: theme.space[4],
  marginBottom: theme.space[4],
  position: `relative`,
  // borderRadius: 2,
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
          accessibilityLabel={getAccessibilityLabel(c, true)}
          textColor={getTextColor(c.contrast)}
          name={c.name}
          isBase={c.base}
          swatchStyle={swatchStyle}
        />
      )
    })

  return colors
}

const ColorRow = ({ color, handler }) => {
  const node = Object.keys(palette)
    .filter(group => group === color)
    .map(node => node)

  return (
    <Box key={node} display={{ xxs: `block`, lg: `flex` }} alignItems="center">
      <Box
        width={{ lg: `${bpWidth / 2}px` }}
        textAlign={{ lg: `right` }}
        mr={{ lg: bpMargin }}
      >
        <button
          onClick={e => {
            handler(e, node)
          }}
          css={{
            cursor: `pointer`,
            WebkitAppearance: `none`,
            border: 0,
            background: `none`,
            padding: 0,
          }}
        >
          <SectionSubheading fontWeight={0} mt={0} fontSize={4}>
            {capitalize(node)}
          </SectionSubheading>
        </button>
      </Box>
      <Flex flexWrap="wrap">
        <Flex flexDirection="row" alignItems="stretch">
          {range.range(0, 5).map(i => colores(node)[i])}
        </Flex>
        <Flex flexDirection="row" alignItems="stretch">
          {range.range(5, 10).map(i => colores(node)[i])}
        </Flex>
      </Flex>
    </Box>
  )
}

const LegacyColorIcon = ({ textColor }) => (
  <Box
    borderRadius={7}
    fontSize={0}
    lineHeight="solid"
    height="8px"
    width="8px"
    display="inline-block"
    bg={textColor}
  />
)

const Overview = ({ handler }) => (
  <>
    <div>
      <Flex alignItems="center">
        <LegacyColorIcon textColor="grey.50" />
        {` `}
        <Text as="span" fontSize={1} ml={2} color="grey.50">
          Named color
        </Text>
      </Flex>
      <Box
        ml={{ lg: `30rem` }}
        alignItems={{ lg: `flex-end` }}
        display={{ xxs: `none`, lg: `flex` }}
      >
        <div css={swatchStyle}>90</div>
        <div css={swatchStyle}>80</div>
        <div css={swatchStyle}>70</div>
        <div css={swatchStyle}>60</div>
        <div css={swatchStyle}>50</div>
        <div css={swatchStyle}>40</div>
        <div css={swatchStyle}>30</div>
        <div css={swatchStyle}>20</div>
        <div css={swatchStyle}>10</div>
        <div css={swatchStyle}>5</div>
      </Box>
    </div>
    <Box display={{ lg: `flex` }}>
      <SectionHeading width={`${bpWidth / 2}px`}>Primary</SectionHeading>
      <div>
        <ColorRow color="purple" handler={handler} />
        <ColorRow color="orange" handler={handler} />
      </div>
    </Box>
    <Box display={{ lg: `flex` }}>
      <SectionHeading width={`${bpWidth / 2}px`}>Secondary</SectionHeading>
      <div>
        <ColorRow color="magenta" handler={handler} />
        <ColorRow color="blue" handler={handler} />
        <ColorRow color="teal" handler={handler} />
        <ColorRow color="yellow" handler={handler} />
        <ColorRow color="red" handler={handler} />
        <ColorRow color="green" handler={handler} />
      </div>
    </Box>
    <Box display={{ lg: `flex` }}>
      <SectionHeading width={`${bpWidth / 2}px`}>Neutral</SectionHeading>
      <div>
        <ColorRow color="grey" handler={handler} />
        {/* <ColorRow color="blackFade" handler={handler} />
        <ColorRow color="whiteFade" handler={handler} /> */}
      </div>
    </Box>
  </>
)

export default Overview
