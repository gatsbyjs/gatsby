import { css } from "@emotion/core"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/core"
import {
  mediaQueries,
  colors,
  fontSizes,
  radii,
  space,
} from "../../gatsby-plugin-theme-ui"
import { formInputFocus, focusStyle } from "../../utils/styles"

const rotation = keyframes`
  0% {
    transform: translateX(${space[1]}) rotate(0deg);
  }
  100% {
    transform: translateX(${space[1]}) rotate(360deg);
  }
`

const buttonStyles = css`
  -webkit-appearance: none;
  align-items: center;
  background: ${colors.gatsby};
  border: none;
  border-radius: ${radii[2]}px;
  color: ${colors.white};
  cursor: pointer;
  display: flex;
  font-size: ${fontSizes[1]};
  padding: ${space[2]} ${space[3]};
  transition: 0.5s;
  z-index: 1;

  svg {
    height: ${space[4]};
    transform: translateX(${space[1]});
    width: ${space[4]};
  }

  &:focus {
    ${focusStyle}
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.9;
  }
`

export const SubmitButton = styled(`button`)`
  ${buttonStyles};

  .submitting & {
    svg {
      animation: ${rotation} 1s linear infinite;
    }
  }

  @media screen and (prefers-reduced-motion: reduce) {
    .submitting & {
      svg {
        animation: none;
      }
    }
  }
`

export const CloseButton = styled(`button`)`
  ${buttonStyles};
  background: ${props => props.theme.colors.widget.background};
  border: 1px solid ${props => props.theme.colors.input.border};
  color: ${props => props.theme.colors.text.secondary};

  :focus {
    ${formInputFocus}
  }
`

export const ToggleButtonLabel = styled(`span`)`
  align-items: center;
  border: 1px solid ${props => props.theme.colors.blue[10]};
  background: ${props => props.theme.colors.blue[5]};
  border-radius: ${props => props.theme.radii[2]}px;
  display: flex;
  height: 2.5rem;
  padding: 0 ${props => props.theme.space[9]} 0 ${props => props.theme.space[3]};
  transition: 0.5s;
  white-space: nowrap;
  width: 100%;

  ${mediaQueries.lg} {
    background: ${props => props.theme.colors.white};
    border: 0;
    box-shadow: ${props => props.theme.shadows.floating};
    width: auto;
    z-index: 1;
  }
`

export const ToggleButtonIcon = styled(`span`)`
  align-items: center;
  background: ${props => props.theme.colors.accent};
  border-radius: ${props => props.theme.radii[6]};
  color: ${props => props.theme.colors.white};
  display: flex;
  font-size: ${props => props.theme.fontSizes[1]};
  height: ${props => props.theme.space[8]};
  justify-content: center;
  position: absolute;
  right: ${props => props.theme.space[1]};
  transform: scale(0.6);
  transition: 0.5s;
  width: ${props => props.theme.space[8]};
  z-index: 2;

  svg {
    fill: ${props => props.theme.colors.white};
    height: ${props => props.theme.space[6]};
    width: ${props => props.theme.space[6]};
    transition: 0.5s;
  }

  ${mediaQueries.lg} {
    .opened &,
    .failed &,
    .success &,
    .submitting & {
      svg {
        height: ${props => props.theme.space[5]};
        width: ${props => props.theme.space[5]};
      }

      &:hover {
        svg {
          transform: rotate(90deg);
          fill: ${props => props.theme.colors.accent};
        }
      }
    }
  }

  @media screen and (prefers-reduced-motion: reduce) {
    transition: 0;
  }
`

export const ToggleButton = styled(`button`)`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${props => props.theme.radii[2]}px;
  cursor: pointer;
  display: flex;
  padding: 0;
  position: relative;
  transition: 0.6s ease;
  width: 100%;
  z-index: 3;

  &:hover {
    ${ToggleButtonLabel} {
      box-shadow: 0 0 0 0.12rem ${props => props.theme.colors.accent}88;
    }
  }

  &:focus {
    ${focusStyle}
  }

  .opened &,
  .failed &,
  .success &,
  .submitting & {
    display: none;
  }

  ${mediaQueries.lg} {
    bottom: 0;
    position: absolute;
    right: 0;
    width: auto;

    .opened &,
    .failed &,
    .success &,
    .submitting & {
      display: flex;
      transform: translate(-${props => props.theme.space[2]}, -26rem);

      ${ToggleButtonIcon} {
        background: ${props => props.theme.colors.widget.background};
        border: 1px solid ${props => props.theme.colors.ui.border.subtle};
        transform: scale(1);

        svg {
          fill: ${props => props.theme.colors.text.secondary};
        }
      }

      &:focus {
        box-shadow: none;
        ${ToggleButtonIcon} {
          ${focusStyle};
        }
      }
    }
  }

  @media screen and (prefers-reduced-motion: reduce) {
    transition: 0;
  }
`
