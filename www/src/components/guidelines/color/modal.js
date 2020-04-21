import React from "react"
import styled from "@emotion/styled"
import themeGet from "@styled-system/theme-get"

import { Box, Flex, Heading, Text } from "../system"
import {
  getA11yLabel,
  getTextColor,
  a11y,
} from "../../../utils/guidelines/color"
import { focusStyle } from "../../../utils/styles"
import { colors as themeColors } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const Column = styled(Flex)()

Column.defaultProps = {
  flexWrap: `wrap`,
  width: { lg: `50%` },
  p: { xxs: 6, md: 8 },
  m: 0,
}

const CloseButton = styled(Flex)(
  {
    border: 0,
    cursor: `pointer`,
    outline: 0,
    WebkitAppearance: `none`,
  },
  props => {
    return {
      transition: `all ${themeGet(`transition.speed.fast`)} ${themeGet(
        `transition.curve.default`
      )}`,
      ":hover, :focus": {
        ...focusStyle,
        color: themeGet(`colors.orange.50`)(props),
      },
    }
  }
)

CloseButton.defaultProps = {
  as: `button`,
  alignItems: `center`,
  bg: `transparent`,
  borderRadius: 6,
  fontSize: 6,
  height: 48,
  justifyContent: `center`,
  ml: `auto`,
  width: 48,
}

const AADescription = () => (
  <Text as="p" mb={0}>
    This text is conforming to AA requirements of the WCAG. This is a score of
    at least <strong>4.5</strong>, the required contrast score for text sizes
    below 18pt/~24px @1x.
  </Text>
)

const AALargeDescription = () => (
  <Text as="p" fontSize={5} mb={0}>
    This text is conforming to <strong>AA Large</strong> — the smallest
    acceptable amount of contrast for type sizes of 14pt bold/18pt (which
    roughly translates to ~18.5px bold/24px @1x) and larger. This is a score of
    at least
    {` `}
    <strong>3.0</strong>.
  </Text>
)

const AAADescription = () => (
  <Text as="p" mb={0}>
    This text is conforming to AAA requirements of WCAG. The contrast score of
    at least <strong>7.0</strong> qualifies it for long form text.
  </Text>
)

// Renders either white or black text samples
const TextSamples = ({ contrast, bg, colorName }) => {
  const inverted = contrast.blackOnColor < contrast.whiteOnColor
  const colors = inverted ? themeColors.whiteFade : themeColors.blackFade

  return (
    <>
      {Object.keys(colors).map((color, i) => {
        const a11yInfo = a11y(colors[color], bg)
        const a11yLabel = getA11yLabel(a11yInfo)
        if (a11yLabel !== `Fail`) {
          return (
            <Box key={`text-sample-${colorName}-${color}-${i}`}>
              <Flex color={colors[color]}>
                <Text
                  as="code"
                  color={colors[color]}
                  mr={4}
                  css={{
                    ":before, :after": { display: `none` },
                    background: `none`,
                  }}
                >
                  {inverted ? `white` : `black`}Fade[{color}]
                </Text>
                {` `}
                <Flex>
                  <Text
                    color={colors[color]}
                    mr={4}
                    textAlign="right"
                    width="40px"
                  >
                    {parseFloat(
                      Math.round(a11yInfo.contrast * 100) / 100
                    ).toFixed(2)}
                  </Text>
                  {a11yLabel}
                </Flex>
              </Flex>
            </Box>
          )
        } else {
          return false
        }
      })}
    </>
  )
}

const modalContent = (palette, color) => {
  let colors = []

  Object.keys(palette[color].colors)
    .sort((a, b) => b - a)
    .forEach((colorNumber, index) => {
      const c = palette[color].colors[colorNumber]
      const textColor = getTextColor(c.contrast)

      colors.push(
        <Box width="100%" display={{ lg: `flex` }} key={`palette-${index}`}>
          <Column bg={c.hex} color={textColor}>
            <Text
              as="span"
              fontWeight="bold"
              color={textColor}
              fontFamily="monospace"
              mb={4}
            >
              colors.{color}[{colorNumber}] {c.name && c.name}
            </Text>
            <Text as="span" ml="auto" mr={4} color={textColor}>
              {c.hex}
            </Text>
            <Text as="span" color={textColor}>
              {c.rgb.red}, {c.rgb.green}, {c.rgb.blue}
            </Text>
            <Box width="100%" flexShrink={0}>
              <TextSamples
                contrast={c.contrast}
                bg={c.hex}
                colorName={palette[color]}
              />
            </Box>
          </Column>
          <Column bg="white">
            <Text
              as="p"
              color="grey.80"
              fontFamily="monospace"
              fontWeight="bold"
              mr={3}
              mb={4}
            >
              colors.{color}[{colorNumber}] {c.name && c.name}
            </Text>
            <Text as="span" color="grey.80" fontWeight="body" ml="auto">
              {c.contrast.colorOnWhite.toFixed(2)} /{` `}
              {getA11yLabel(c.a11y)}
            </Text>
            <Box width="100%" flexShrink={0} css={{ "& p": { color: c.hex } }}>
              {getA11yLabel(c.a11y) === `AA` && <AADescription />}
              {getA11yLabel(c.a11y) === `AAA` && <AAADescription />}
              {getA11yLabel(c.a11y) === `AA Large` && <AALargeDescription />}
            </Box>
          </Column>
        </Box>
      )
    })

  return colors
}

const ColorModal = ({ palette, color, handleModalClose }) => {
  const base = palette[color].colors[palette[color].base]

  return (
    <>
      <Flex alignItems="baseline" p={{ xxs: 6, md: 8 }}>
        <Heading color="black" mr={4} mt={0}>
          {palette[color].name}
        </Heading>
        <CloseButton
          onClick={handleModalClose}
          aria-label={`Close “${palette[color].name}” modal`}
          paddingBottom="6"
        >
          &times;
        </CloseButton>
      </Flex>
      <Box p={{ xxs: 6, md: 8 }} bg={base.hex}>
        <Heading
          as="h2"
          m={0}
          lineHeight="solid"
          color={getTextColor(base.contrast)}
        >
          Base {palette[color].base} {base.name && <span> — {base.name}</span>}
        </Heading>
      </Box>
      {modalContent(palette, color).map(color => color)}
    </>
  )
}

export default ColorModal
