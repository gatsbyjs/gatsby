import { css } from "@emotion/core"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/core"
import { breakpoints, colors, fontSizes, radii } from "../../utils/presets"

const rotation = keyframes`
  0% {
    transform: translateX(0.25rem) rotate(0deg);
  }
  100% {
    transform: translateX(0.25rem) rotate(360deg);
  }
`

export const focusStyle = css`
  box-shadow: 0 0 0 0.12rem ${colors.accent};
  outline: none;
`

const buttonStyles = css`
  -webkit-appearance: none;
  align-items: center;
  background: ${colors.gatsby};
  border: none;
  border-radius: ${radii[1]}px;
  color: white;
  cursor: pointer;
  display: flex;
  font-size: ${fontSizes[1]};
  padding: 0.3rem 0.75rem;
  transition: 0.5s;
  z-index: 1;

  svg {
    height: 1.1rem;
    transform: translateX(0.25rem);
    width: 1.1rem;
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
  border: 1px solid ${colors.gatsby};
  color: ${colors.gatsby};
`

export const ToggleButtonLabel = styled(`span`)`
  align-items: center;
  background: ${colors.white};
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  display: flex;
  height: 2.5rem;
  padding: 0 2.5rem 0 0.75rem;
  transition: 0.5s;
  white-space: nowrap;
  width: 100%;

  ${breakpoints.lg} {
    width: auto;
  }
`

export const ToggleButtonIcon = styled(`span`)`
  align-items: center;
  background: ${colors.gatsby};
  border-radius: 50%;
  color: ${colors.white};
  display: flex;
  font-size: 1rem;
  height: 1.4rem;
  justify-content: center;
  position: absolute;
  right: 2rem;
  transform: scale(1);
  transition: 0.5s;
  width: 1.4rem;

  svg {
    fill: ${colors.white};
    height: 0.8rem;
    width: 0.8rem;
    transition: 0.5s;
  }

  ${breakpoints.lg} {
    right: 0.75rem;

    .opened &,
    .failed &,
    .success &,
    .submitting & {
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

  ${breakpoints.lg} {
    bottom: 0;
    position: absolute;
    right: 0;
    width: auto;

    .opened &,
    .failed &,
    .success &,
    .submitting & {
      display: flex;
      transform: translate(-0.5rem, -26rem);

      ${ToggleButtonIcon} {
        background: ${colors.white};
        border: 1px solid #eee;
        transform: scale(1.8);

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
