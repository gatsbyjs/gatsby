/** @jsx jsx */
import { jsx } from "@emotion/core"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/core"
import { breakpoints } from "./presets"

const boldEntry = keyframes`
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

const opacityEntry = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

const WrapperDiv = styled(`div`)`
  background-color: white;
  border: 1px solid #eee;
  border-radius: 0.3rem;
  font-family: sans-serif;
  height: 100%;
  opacity: 0.5;
  overflow-y: auto;
  padding: 1.5rem 1rem;
  width: 100%;
  z-index: 2;

  [tabindex="-1"]:focus {
    outline: none;
  }

  .opened & {
    animation: ${boldEntry} 0.5s ease forwards;
  }

  .failed &,
  .success & {
    animation: ${opacityEntry} 0.5s ease forwards;
  }

  @media screen and (prefers-reduced-motion: reduce) {
    .opened & {
      animation: none;
      transform: scale(1);
      opacity: 1;
    }

    .failed &,
    .success & {
      animation: none;
      transform: scale(1);
      opacity: 1;
    }
  }

  .submitting & {
    transform: scale(1);
    opacity: 1;
  }

  @media (min-width: ${breakpoints.desktop}) {
    box-shadow: rgba(46, 41, 51, 0.08) 0px 4px 8px,
      rgba(71, 63, 79, 0.16) 0px 8px 16px;
    height: 100%;
    padding: 2rem 1.75rem;
    transform: scale(0);
    transform-origin: top center;
  }
`

const WidgetWrapper = ({ children, handleClose = () => {} }) => {
  const handleEscapeKey = event => {
    if (event.keyCode === 27) {
      handleClose()
    }
  }

  return <WrapperDiv onKeyDown={handleEscapeKey}>{children}</WrapperDiv>
}

export default WidgetWrapper
