import { css } from "@emotion/core"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/core"
import {
  mediaQueries,
  colors,
  fontSizes,
  radii,
  shadows,
  space,
} from "../../utils/presets"

const rotation = keyframes`
  0% {
    transform: translateX(${space[1]}) rotate(0deg);
  }
  100% {
    transform: translateX(${space[1]}) rotate(360deg);
  }
`

export const focusStyle = css`
  outline: 2px solid ${colors.accent};
  outline-offset: -2px;
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

  &:hover {
    box-shadow: 0 0 0 0.12rem ${colors.accent}88;
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
  background: ${colors.white};
  border: 1px solid ${colors.gray.border};
  color: ${colors.gatsby};
`

export const ToggleButtonLabel = styled(`span`)`
  align-items: center;
  background: ${colors.white};
  border: 1px solid ${colors.gray.border};
  border-radius: ${radii[2]}px;
  display: flex;
  height: 2.5rem;
  padding: 0 ${space[8]} 0 ${space[3]};
  transition: 0.5s;
  white-space: nowrap;
  width: 100%;

  ${mediaQueries.lg} {
    box-shadow: ${shadows.floating};
    width: auto;
  }
`

export const ToggleButtonIcon = styled(`span`)`
  align-items: center;
  background: ${colors.lilac};
  border-radius: ${radii[6]};
  color: ${colors.white};
  display: flex;
  font-size: ${fontSizes[1]};
  height: ${space[8]};
  justify-content: center;
  position: absolute;
  right: ${space[1]};
  transform: scale(0.6);
  transition: 0.5s;
  width: ${space[8]};

  svg {
    fill: ${colors.white};
    height: ${space[5]};
    width: ${space[5]};
    transition: 0.5s;
  }

  ${mediaQueries.lg} {
    .opened &,
    .failed &,
    .success &,
    .submitting & {
      svg {
        height: ${space[6]};
        width: ${space[6]};
      }

      &:hover {
        svg {
          transform: rotate(90deg);
          fill: ${colors.accent};
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
  cursor: pointer;
  display: flex;
  padding: 0;
  position: relative;
  transition: 0.6s ease;
  width: 100%;
  z-index: 3;

  &:hover {
    ${ToggleButtonLabel} {
      box-shadow: 0 0 0 0.12rem ${colors.accent}88;
    }
  }

  &:focus {
    outline: none;

    ${ToggleButtonLabel} {
      ${focusStyle}
    }
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
      transform: translate(-${space[2]}, -26rem);

      ${ToggleButtonIcon} {
        background: ${colors.white};
        border: 1px solid ${colors.gray.border};
        transform: scale(1);

        svg {
          fill: ${colors.gatsby};
        }
      }

      &:focus {
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
