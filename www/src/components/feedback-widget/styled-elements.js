import styled from "@emotion/styled"
import { mediaQueries } from "../../gatsby-plugin-theme-ui"

export const WidgetContainer = styled(`div`)`
  margin: ${props => props.theme.space[7]} auto;
  padding: 0 ${props => props.theme.space[6]} ${props => props.theme.space[9]};
  max-width: 42rem;

  ${mediaQueries.md} {
    padding-bottom: 0;
  }

  ${mediaQueries.lg} {
    &:not(.closed) {
      height: 26rem;
      width: 20rem;
    }

    bottom: ${props => props.theme.space[6]};
    padding: 0;
    position: fixed;
    right: ${props => props.theme.space[6]};
    margin: 0;
    width: auto;
  }
`

export const Title = styled(`h2`)`
  display: block;
  font-size: ${props => props.theme.fontSizes[4]};
  letter-spacing: ${props => props.theme.letterSpacings.tight};
  line-height: ${props => props.theme.lineHeights.dense};
  margin: 0;
  margin-bottom: ${props => props.theme.space[2]};
  text-align: center;
`

export const Actions = styled(`div`)`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

// refactor—we have this in navigation-mobile,
// and in some shared styles thing for the showcase views
export const ScreenReaderText = styled(`span`)`
  border: 0;
  clip: rect(0, 0, 0, 0);
  -webkit-clip: rect(0, 0, 0, 0);
  height: 1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
`
