import styled from "@emotion/styled"

import { space, radii, colors, shadows } from "../../utils/presets"

const BOX_SHADOW_BLUR = space[2]

export const HorizontalScroller = styled(`div`)`
  overflow-x: scroll;
  -webkit-overflow-scrolling: touch;
`

export const HorizontalScrollerContent = styled(`ul`)`
  display: inline-flex;
  list-style: none;
  padding: ${BOX_SHADOW_BLUR} ${space[6]} calc(${BOX_SHADOW_BLUR} * 1.5);
  margin: 0;
`

export const HorizontalScrollerItem = styled(`li`)`
  background: ${colors.white};
  border-radius: ${radii[2]}px;
  box-shadow: ${shadows.raised};
  margin: 0;
  margin-right: ${space[6]};
  width: 77vw;

  :last-child {
    margin-right: 0;
  }
`
