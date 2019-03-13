import styled from "@emotion/styled"

import { rhythm } from "../../utils/typography"
import presets, { space, radii, colors } from "../../utils/presets"

const BOX_SHADOW_BLUR = `8px`

export const HorizontalScroller = styled(`div`)`
  overflow-x: scroll;
  -webkit-overflow-scrolling: touch;
`

export const HorizontalScrollerContent = styled(`ul`)`
  display: inline-flex;
  list-style: none;
  padding: ${BOX_SHADOW_BLUR} ${rhythm(space[6])} calc(${BOX_SHADOW_BLUR} * 1.5);
  margin: 0;
`

export const HorizontalScrollerItem = styled(`li`)`
  background: ${colors.white};
  border-radius: ${radii[2]}px;
  /* box-shadow: 0 0 ${BOX_SHADOW_BLUR} rgba(0, 0, 0, 0.2); */
  box-shadow: ${presets.shadows.card};
  margin: 0;
  margin-right: ${rhythm(space[6])};
  width: 77vw;

  :last-child {
    margin-right: 0;
  }
`
