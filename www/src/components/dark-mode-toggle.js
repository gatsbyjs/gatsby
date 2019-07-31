import React from "react"
import styled from "@emotion/styled"
import { useColorMode } from "theme-ui"

import { mediaQueries } from "../gatsby-plugin-theme-ui"

// kudos to our friends at narative.co
// https://github.com/narative/gatsby-theme-novela/blob/fb38329e17595df6e846be1d33517ff6125cde4e/src/components/Navigation/Navigation.Header.tsx
// and Aaron Iker
// https://codepen.io/aaroniker/pen/KGpXZo

const IconWrapper = styled.button`
  align-items: center;
  background: transparent;
  border-radius: 5px;
  border: 0;
  cursor: pointer;
  display: inline-flex;
  height: 24px;
  justify-content: center;
  opacity: 0.5;
  outline: none;
  position: relative;
  transform: scale(0.75);
  transition: opacity 0.3s ease;
  vertical-align: middle;
  width: 40px;

  &:hover {
    opacity: 1;
  }

  &[data-a11y="true"]:focus::after {
    background: rgba(255, 255, 255, 0.01);
    border-radius: 5px;
    border: 2px solid ${p => p.theme.colors.accent};
    content: "";
    height: 160%;
    left: 0;
    position: absolute;
    top: -30%;
    width: 100%;
  }
`

const MoonOrSun = styled.div`
  border: ${p => (p.isDark ? `4px` : `2px`)} solid
    ${p => p.theme.colors.navigation.socialLink};
  background: ${p => p.theme.colors.navigation.socialLink};
  border-radius: 50%;
  height: 24px;
  overflow: ${p => (p.isDark ? `visible` : `hidden`)};
  position: relative;
  transform: scale(${p => (p.isDark ? 0.55 : 1)});
  transition: all 0.45s ease;
  width: 24px;

  &::before {
    border-radius: 50%;
    border: 2px solid ${p => p.theme.colors.navigation.socialLink};
    content: "";
    height: 24px;
    opacity: ${p => (p.isDark ? 0 : 1)};
    position: absolute;
    right: -9px;
    top: -9px;
    transform: translate(${p => (p.isDark ? `14px, -14px` : `0, 0`)});
    transition: transform 0.45s ease;
    width: 24px;
  }

  &::after {
    border-radius: 50%;
    box-shadow: 0 -23px 0 ${p => p.theme.colors.navigation.socialLink},
      0 23px 0 ${p => p.theme.colors.navigation.socialLink},
      23px 0 0 ${p => p.theme.colors.navigation.socialLink},
      -23px 0 0 ${p => p.theme.colors.navigation.socialLink},
      15px 15px 0 ${p => p.theme.colors.navigation.socialLink},
      -15px 15px 0 ${p => p.theme.colors.navigation.socialLink},
      15px -15px 0 ${p => p.theme.colors.navigation.socialLink},
      -15px -15px 0 ${p => p.theme.colors.navigation.socialLink};
    content: "";
    height: 8px;
    left: 50%;
    margin: -4px 0 0 -4px;
    position: absolute;
    top: 50%;
    width: 8px;
    transform: scale(${p => (p.isDark ? 1 : 0)});
    transition: all 0.35s ease;

    ${mediaQueries.md} {
      transform: scale(${p => (p.isDark ? 0.92 : 0)});
    }
  }
`

const MoonMask = styled.div`
  background: ${p => p.theme.colors.background};
  border-radius: 50%;
  border: 0;
  height: 24px;
  opacity: ${p => (p.isDark ? 0 : 1)};
  position: absolute;
  right: -1px;
  top: -8px;
  transform: translate(${p => (p.isDark ? `14px, -14px` : `0, 0`)});
  transition: background 0.25s var(--ease-in-out-quad), transform 0.45s ease;
  width: 24px;
`

function DarkModeToggle() {
  const [colorMode, setColorMode] = useColorMode()
  const isDark = colorMode === `dark`

  function toggleColorMode(event) {
    event.preventDefault()
    setColorMode(isDark ? `light` : `dark`)
  }

  return (
    <IconWrapper
      isDark={isDark}
      onClick={toggleColorMode}
      data-a11y="false"
      aria-label={isDark ? `Activate light mode` : `Activate dark mode`}
      title={isDark ? `Activate light mode` : `Activate dark mode`}
    >
      <MoonOrSun isDark={isDark} />
      <MoonMask isDark={isDark} />
    </IconWrapper>
  )
}

export default DarkModeToggle
