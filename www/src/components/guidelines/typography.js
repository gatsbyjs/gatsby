import styled from "@emotion/styled"

import { Heading, Text } from "./system"

const themed = key => props => props.theme[key]

export const PageHeading = styled(Heading)(
  { position: `relative` },
  themed(`PageHeading`)
)

PageHeading.defaultProps = {
  as: `h1`,
  color: `grey.90`,
  fontSize: { xxs: 8, sm: 10 },
  letterSpacing: `tight`,
  pt: { xxs: 7 },
  mb: { xxs: 4, lg: 7 },
  m: 0,
}

export const Intro = styled(Text)(themed(`Intro`))

Intro.defaultProps = {
  as: `p`,
  color: `grey.90`,
  fontFamily: `header`,
  fontSize: { xxs: 4, sm: 5 },
  fontWeight: `400`,
  lineHeight: `dense`,
  maxWidth: `36rem`,
  mb: 3,
  pb: 6,
  position: `relative`,
  zIndex: 1,
}

export const SectionHeading = styled(PageHeading)(themed(`SectionHeading`))

SectionHeading.defaultProps = {
  as: `h2`,
  color: `grey.90`,
  m: 0,
  mb: 4,
  fontSize: { xs: 6 },
}

export const SectionSubheading = styled(PageHeading)(
  themed(`SectionSubheading`)
)

SectionSubheading.defaultProps = {
  as: `h3`,
  color: `grey.90`,
  fontSize: { xs: 5 },
}
