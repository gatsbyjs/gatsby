import React from "react"
import MdLaunch from "react-icons/lib/md/launch"

import { Box, Flex, Link, Text } from "../system"
import BoxWithBorder from "../box-with-border"
import { getTextColor } from "../../../utils/guidelines/color"
import { SrOnly } from "../typography"
import { colors } from "../../../utils/presets"

const ColorValue = ({ label, inverted, value, href }) => (
  <Box mt={4} px={2} css={{ flexShrink: 0, flexBase: `50%` }}>
    <Text
      color={inverted ? `whiteFade.70` : `blackFade.70`}
      fontFamily="header"
      fontSize={1}
    >
      {label}
    </Text>
    <Flex alignItems="center">
      <Text
        fontSize={1}
        css={{ whiteSpace: `nowrap` }}
        color={inverted ? `whiteFade.80` : `blackFade.80`}
      >
        {value}
        {href && (
          <>
            {` `}
            <Link
              href={href}
              css={{
                "&&": {
                  // couldn't get `themeGet` to work here
                  border: 0,
                  color: inverted ? colors.whiteFade[80] : colors.blackFade[80],
                },
              }}
            >
              <MdLaunch style={{ marginLeft: `0.25rem` }} />
              <SrOnly>Pantone Matching System reference</SrOnly>
            </Link>
          </>
        )}
      </Text>
    </Flex>
  </Box>
)

const ColorSwatch = ({ color, ...rest }) => {
  const textColor = getTextColor(color.contrast)
  const inverted = textColor === `white`

  return (
    <BoxWithBorder
      width={{ md: 1 / 3 }}
      py={4}
      px={2}
      {...rest}
      bg={color.hex}
      withBorder={!inverted}
    >
      <Text
        fontFamily="header"
        fontSize={4}
        px={2}
        fontWeight={1}
        color={textColor}
      >
        {color.name}
      </Text>
      <Flex flexWrap="wrap">
        <ColorValue value={color.hex} label="HEX" inverted={inverted} />
        <ColorValue
          label="RGB"
          inverted={inverted}
          value={`${color.rgb.red} ${color.rgb.green} ${color.rgb.blue} `}
        />
        {color.pms && (
          <ColorValue
            label="PMS"
            inverted={inverted}
            value={color.pms.value}
            href={color.pms.href}
          />
        )}
        {color.cmyk && (
          <ColorValue
            label="CMYK"
            inverted={inverted}
            value={color.cmyk.value}
          />
        )}
      </Flex>
    </BoxWithBorder>
  )
}

export default ColorSwatch
