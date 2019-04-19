import styled from "@emotion/styled"
import { breakpoints } from "./presets"

export const WidgetContainer = styled(`div`)`
  height: 2.5rem;
  margin: 2rem 0;
  position: inline;
  width: 100%;

  &:not(.closed) {
    height: 26rem;
  }

  @media (min-width: ${breakpoints.desktop}) {
    &:not(.closed) {
      height: 26rem;
      width: 20rem;
    }

    bottom: 1.5rem;
    position: fixed;
    right: 1.5rem;
    margin: 0;
    width: auto;
  }
`

export const Title = styled(`h2`)`
  display: block;
  font-size: 1.2rem;
  letter-spacing: -0.01em;
  line-height: 1.2;
  margin: 0;
  margin-bottom: 0.5rem;
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
