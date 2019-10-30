/** @jsx jsx */
import { jsx } from "theme-ui"
import styled from "@emotion/styled"
import propTypes from "@styled-system/prop-types"

import { Box } from "./system"

export const Container = styled(Box)()

Container.defaultProps = {
  position: `relative`,
  pr: { xxs: 6, md: 10 },
  pl: { xxs: 6, md: 10 },
  zIndex: 1,
}

export const Section = styled(Container)()

Section.propTypes = {
  ...propTypes.space,
}

Section.defaultProps = {
  ...Container.defaultProps,
  as: `section`,
  pt: { xxs: 4, sm: 5, md: 8 },
  pb: { xxs: 4, sm: 5, md: 8 },
}

export const copyColumnWidth = `20rem`
export const copyColumnGutter = 10

export const Columns = ({ children, ...rest }) => (
  <Box {...rest} display={{ lg: `flex` }} mt={4} mb={8}>
    {children}
  </Box>
)

export const CopyColumn = ({
  children,
  sticky = true,
  narrow = true,
  ...rest
}) => (
  <Box
    {...rest}
    fontSize={2}
    mr={{ md: copyColumnGutter }}
    mb={{ xs: 4, lg: 0 }}
    maxWidth={{ xxs: `30rem`, lg: `none` }}
    width={{ lg: narrow ? copyColumnWidth : `30rem` }}
    flex={{ lg: `0 0 auto` }}
    css={{
      "p, ul, ol": {
        maxWidth: `40rem`,
      },
    }}
  >
    <div
      sx={{
        position: sticky ? `sticky` : `relative`,
        top: t =>
          sticky
            ? `calc(${t.sizes.headerHeight} + ${t.sizes.bannerHeight} + 2.5rem)`
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
        maxWidth: `40rem`,
      },
    }}
    {...props}
  >
    {children}
  </Box>
)
