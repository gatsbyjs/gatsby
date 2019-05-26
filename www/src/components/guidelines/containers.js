import React from "react"

import styled from "@emotion/styled"
import { space } from "styled-system"

import { Box } from "./system"
import { sizes } from "../../utils/presets"

const themed = key => props => props.theme[key]

export const Container = styled(Box)(themed(`Container`))

Container.defaultProps = {
  position: `relative`,
  pr: { xxs: 6 },
  pl: { xxs: 6 },
  zIndex: 1,
}

export const Section = styled(Container)(themed(`Section`))

Section.propTypes = {
  ...space.propTypes,
}

Section.defaultProps = {
  ...Container.defaultProps,
  as: `section`,
  pt: { xxs: 4, sm: 5, md: 8 },
  pb: { xxs: 4, sm: 5, md: 8 },
}

export const Columns = ({ children, ...rest }) => (
  <Box {...rest} display={{ lg: `flex` }} mt={4} mb={8}>
    {children}
  </Box>
)

export const CopyColumn = ({ children, sticky = true, ...rest }) => (
  <Box
    {...rest}
    fontSize={2}
    mr={{ md: 7 }}
    mb={{ xs: 4, lg: 0 }}
    maxWidth={{ xxs: `30rem`, lg: `none` }}
    width={{ lg: `25rem` }}
    flex={{ lg: `0 0 auto` }}
    css={{
      "p, ul, ol": {
        maxWidth: `30rem`,
      },
    }}
  >
    <div
      css={{
        position: sticky ? `sticky` : `relative`,
        top: sticky
          ? `calc(${sizes.headerHeight} + ${sizes.bannerHeight} + 2.5rem)`
          : false,
      }}
    >
      {children}
    </div>
  </Box>
)

export const ContentColumn = ({ children, fullWidth, ...props }) => (
  <Box
    width={{ lg: fullWidth ? `auto` : `50rem` }}
    maxWidth={{ lg: fullWidth ? `none` : false }}
    css={{
      flexGrow: 0,
      overflow: `hidden`,
      position: `relative`,
      "p, ul, ol": {
        maxWidth: `30rem`,
      },
    }}
    {...props}
  >
    {children}
  </Box>
)
