import styled from "@emotion/styled"

import { Heading, Text } from "./system"
import { visuallyHidden } from "../../utils/styles"

export const PageHeading = styled(Heading)({ position: `relative` })

PageHeading.defaultProps = {
  as: `h1`,
  color: `heading`,
  fontSize: { xxs: 8, sm: 10 },
  letterSpacing: `tight`,
  pt: { xxs: 7 },
  mb: { xxs: 4, lg: 7 },
}

export const Intro = styled(Text)()

Intro.defaultProps = {
  as: `p`,
  color: `text`,
  fontFamily: `header`,
  fontSize: { xxs: 4, sm: 5 },
  fontWeight: `body`,
  lineHeight: `dense`,
  maxWidth: `36rem`,
  mb: 3,
  pb: 6,
  position: `relative`,
  zIndex: 1,
}

export const SectionHeading = styled(PageHeading)()

SectionHeading.defaultProps = {
  as: `h2`,
  color: `heading`,
  mt: 0,
  mb: 4,
  fontSize: { xs: 6 },
}

export const SectionSubheading = styled(PageHeading)()

SectionSubheading.defaultProps = {
  as: `h3`,
  color: `heading`,
  fontSize: { xs: 5 },
}

export const SrOnly = styled(Text)(visuallyHidden)

SrOnly.defaultProps = {
  as: `span`,
}
