import React from "react"
import styled from "@emotion/styled"
import { themeGet } from "styled-system"

import { Box, Flex, Heading, Text } from "../system"
import {
  getAccessibilityLabel,
  getTextColor,
} from "../../../utils/guidelines/color"

const CloseButton = styled(Flex)(
  {
    border: 0,
    cursor: `pointer`,
    outline: 0,
    WebkitAppearance: `none`,
  },
  props => {
    return {
      ":focus, :hover": {
        background: themeGet(`colors.grey.20`)(props),
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

// Renders either white or black text samples
const TextSamples = ({ contrast }) => {
  const textLabels = [`High Emphasis`, `Medium Emphasis`, `Disabled`]
  const colorTitle = [`Black`, `White`]
  const whiteOpacity = [1, 0.6, 0.38]
  const blackOpacity = [0.87, 0.6, 0.38]

  const inverted = contrast.blackOnColor < contrast.whiteOnColor

  const colors = inverted
    ? [`whiteFade.80`, `whiteFade.70`, `whiteFade.60`]
    : [`blackFade.80`, `blackFade.70`, `blackFade.60`]

  return (
    <Box pt={3}>
      {colors.map((color, i) => (
        <Text key={`text-sample-${i}`} pb={3} color={color}>
          {textLabels[i]} / {colorTitle[+inverted]}
          {` `}
          {(inverted ? blackOpacity[i] : whiteOpacity[i]) * 100}%
        </Text>
      ))}
    </Box>
  )
}

const colores = (palette, color) => {
  let colors = []

  Object.keys(palette[color].colors)
    .sort((a, b) => b - a)
    .forEach((foo, index) => {
      const c = palette[color].colors[foo]

      colors.push(
        <Box width="100%" display={{ lg: `flex` }} key={`palette-${index}`}>
          <Flex
            bg={c.hex}
            p={7}
            flexWrap="wrap"
            color={getTextColor(c.contrast)}
            width={{ lg: `50%` }}
          >
            <span>
              {9 - index}00 {c.name && c.name}
            </span>
            <span css={{ marginLeft: `auto` }}>{c.hex}</span>
            <Box width="100%" flexShrink={0}>
              <TextSamples contrast={c.contrast} />
            </Box>
          </Flex>
          <Flex
            bg="white"
            p={7}
            flexWrap="wrap"
            color={c.hex}
            width={{ lg: `50%` }}
          >
            <Text as="p" fontSize={7} fontFamily="header" fontWeight={1} mr={3}>
              {palette[color].name} {9 - index}00 {c.name && c.name}
              <br />
              <Text as="span" fontWeight={0}>
                {c.contrast.colorOnWhite.toFixed(2)} {getAccessibilityLabel(c)}
              </Text>
            </Text>
            <Box width="100%" flexShrink={0}>
              {(getAccessibilityLabel(c) === `AA` ||
                getAccessibilityLabel(c) === `AAA`) && (
                <p>
                  This text is conforming to AA
                  {getAccessibilityLabel(c) === `AAA` && <>A</>} requirements of
                  lorem ipsum sunt sicilia est insula. Pork ham sausage
                  Schnitzel foo bar.{` `}
                  {getAccessibilityLabel(c) === `AAA` && (
                    <strong>
                      The contrast score of at least 7.0 qualifies it for long
                      form text.
                    </strong>
                  )}
                </p>
              )}
              {getAccessibilityLabel(c) === `Large` && (
                <p css={{ fontSize: 24 }}>
                  This text is conforming to <strong>AA Large</strong> — the
                  smallest acceptable amount of contrast for type sizes of 18pt
                  and larger. This is a score of at least 3.0. Schnitzel foo
                  bar.
                </p>
              )}
            </Box>
          </Flex>
        </Box>
      )
    })

  return colors
}

const ColorModal = ({ palette, color, handleModalClose }) => {
  const base = palette[color].colors[palette[color].base]

  return (
    <>
      <Flex alignItems="baseline" p={7}>
        <Heading
          css={{
            marginRight: 10,
            marginTop: 0,
          }}
        >
          {palette[color].name}
        </Heading>
        <CloseButton onClick={handleModalClose}>&times;</CloseButton>
      </Flex>
      <Box p={7} bg={base.hex}>
        <Heading
          as="h2"
          m={0}
          lineHeight="solid"
          color={getTextColor(base.contrast)}
        >
          Base {palette[color].base} {base.name && <span> — {base.name}</span>}
        </Heading>
      </Box>
      {colores(palette, color).map(color => color)}
    </>
  )
}

export default ColorModal
