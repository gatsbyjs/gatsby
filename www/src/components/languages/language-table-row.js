/** @jsx jsx */
import { jsx } from "theme-ui"
import styled from "@emotion/styled"
import { css } from "@emotion/core"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import { OutboundLink } from "gatsby-plugin-google-analytics"

import useHover from "../../hooks/use-hover"

import MdLaunch from "react-icons/lib/md/launch"
import ProgressBar from "../progress-bar"
import DefaultLanguageBadge from "./default-language-badge"

const LocalName = styled.strong`
  width: 6rem;
  color: ${p => p.theme.colors.text};
`

const MutedOutboundLink = styled(OutboundLink)`
  && {
    color: inherit;
    &:not(:hover) {
      border-bottom-color: transparent;
    }
  }
`

const Row = styled.div`
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${p => p.theme.space[2]} ${p => p.theme.space[4]};
  margin: 0 -${p => p.theme.space[4]};
  border: 2px solid transparent;
  border-radius: ${p => p.theme.radii[3]};

  color: ${p => p.theme.colors.textMuted};

  &:hover {
    box-shadow: ${p => p.theme.shadows.raised};

    & ${LocalName} {
      color: ${p => p.theme.colors.link.color};
    }
  }

  ${p =>
    p.isDefault &&
    css`
      border-color: ${p.theme.colors.gatsby};

      box-shadow: ${p.theme.shadows.floating};

      & ${LocalName} {
        color: ${p.theme.colors.link.color};
      }
    `}

  ${mediaQueries.md} {
    padding: ${p => p.theme.space[3]} ${p => p.theme.space[6]};
    margin: 0 -${p => p.theme.space[6]};
  }
`

const LanguageTableRow = ({ lang, isDefault, onMakeDefault }) => {
  const [isHovered, hoverHandlers] = useHover()

  return (
    <Row isDefault={isDefault} onClick={onMakeDefault} {...hoverHandlers}>
      <LocalName>{lang.localName}</LocalName>
      <span sx={{ width: "6rem" }}>{lang.name}</span>
      <div sx={{ width: "9rem" }}>
        {isDefault ? (
          <DefaultLanguageBadge>Default language</DefaultLanguageBadge>
        ) : isHovered ? (
          <DefaultLanguageBadge>Set as default</DefaultLanguageBadge>
        ) : null}
      </div>
      <div sx={{ width: "8rem", mr: 2 }}>
        {lang.code !== "en" && <ProgressBar progress={lang.progress} />}
      </div>
      <MutedOutboundLink
        href={`https://github.com/gatsbyjs/gatsby-${lang.code}`}
        onClick={event => {
          event.stopPropagation()
        }}
      >
        Contribute <MdLaunch />
      </MutedOutboundLink>
    </Row>
  )
}

export default LanguageTableRow
