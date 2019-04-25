import styled from "@emotion/styled"
import {
  breakpoints,
  fontSizes,
  letterSpacings,
  lineHeights,
  space,
} from "../../utils/presets"

export const WidgetContainer = styled(`div`)`
  height: ${space[8]};
  margin: ${space[7]} 0;
  position: inline;
  width: 100%;

  &:not(.closed) {
    height: 26rem;
  }

  ${breakpoints.lg} {
    &:not(.closed) {
      height: 26rem;
      width: 20rem;
    }

    bottom: ${space[6]};
    position: fixed;
    right: ${space[6]};
    margin: 0;
    width: auto;
  }
`

export const Title = styled(`h2`)`
  display: block;
  font-size: ${fontSizes[4]};
  letter-spacing: ${letterSpacings.tight};
  line-height: ${lineHeights.dense};
  margin: 0;
  margin-bottom: ${space[2]};
  text-align: center;
`

export const Actions = styled(`div`)`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

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
