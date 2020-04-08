import styled from "@emotion/styled"

import { visuallyHidden } from "../../utils/styles"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

export const WidgetContainer = styled(`div`)`
  margin: ${p => p.theme.space[7]} auto;
  padding: 0 ${p => p.theme.space[6]} ${p => p.theme.space[9]};
  max-width: 42rem;

  ${mediaQueries.md} {
    padding-bottom: 0;
  }

  ${mediaQueries.lg} {
    &:not(.closed) {
      height: 26rem;
      width: 20rem;
    }

    bottom: ${p => p.theme.space[6]};
    padding: 0;
    position: fixed;
    right: ${p => p.theme.space[6]};
    margin: 0;
    width: auto;
  }
`

export const Title = styled(`h2`)`
  display: block;
  font-size: ${p => p.theme.fontSizes[4]};
  letter-spacing: ${p => p.theme.letterSpacings.tight};
  line-height: ${p => p.theme.lineHeights.dense};
  margin: 0;
  margin-bottom: ${p => p.theme.space[2]};
  text-align: center;
`

export const Actions = styled(`div`)`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

export const ScreenReaderText = styled.span(visuallyHidden)
