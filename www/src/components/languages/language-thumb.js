/** @jsx jsx */
import { jsx } from "theme-ui"
import styled from "@emotion/styled"
import { Link } from "gatsby"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

import { localizedPath } from "../../utils/i18n"

import {
  MdLaunch as LaunchIcon,
  MdCheckCircle as CheckCircleIcon,
} from "react-icons/md"

const Container = styled.div`
  padding: ${p =>
    `${p.theme.space[7]} 0 ${p.theme.space[7]} ${p.theme.space[4]}`};
  margin-bottom: ${p => p.theme.space[2]};
  border-bottom: 1px solid ${p => p.theme.colors.ui.border};

  width: 100%;

  ${mediaQueries.sm} {
    width: 50%;
  }

  ${mediaQueries.md} {
    width: 33.333%;
  }

  ${mediaQueries.lg} {
    width: 25%;
  }
`

const EnglishName = styled.p`
  margin-bottom: ${p => p.theme.space[1]};
  font-size: ${p => p.theme.fontSizes[1]};
`

const LocalName = styled(Link)`
  display: block;
  margin-bottom: ${p => p.theme.space[2]};

  font-size: ${p => p.theme.fontSizes[3]};
  font-weight: bold;
`

const ContributionLink = styled.a`
  && {
    font-size: ${p => p.theme.fontSizes[0]};
    color: ${p => p.theme.colors.grey[50]};
  }
`

const LanguageThumb = ({ lang, isCurrent }) => (
  <Container>
    <EnglishName>{lang.name}</EnglishName>
    <LocalName to={localizedPath(lang.code, "/languages")}>
      {lang.localName} {isCurrent && <CheckCircleIcon />}
    </LocalName>
    <ContributionLink
      href={`https://github.com/gatsbyjs/gatsby-${lang.code}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      Contribute <LaunchIcon />
    </ContributionLink>
  </Container>
)

export default LanguageThumb
