/** @jsx jsx */
import { jsx } from "theme-ui"
import PropTypes from "prop-types"
import styled from "@emotion/styled"

import Button from "../button"
import { rhythm } from "../../utils/typography"
import { mediaQueries } from "../../gatsby-plugin-theme-ui"

const ICON_SIZE = 7

export const Header = styled(`header`)`
  ${mediaQueries.md} {
    max-width: 30rem;
  }

  ${mediaQueries.lg} {
    margin-left: ${p => p.theme.space[9]};
  }
`

export const Name = styled(`h3`)`
  align-items: center;
  color: ${p => p.theme.colors.lilac};
  display: flex;
  font-size: ${p => p.theme.fontSizes[2]};
  font-weight: ${p => p.theme.fontWeights.body};
  margin: 0;
  margin-left: calc(${p => p.theme.space[ICON_SIZE]} * -0.2);
  margin-bottom: 0.5em;

  ${mediaQueries.lg} {
    margin-left: calc(${p => p.theme.space[ICON_SIZE]} * -1.2);
  }
`

const Icon = styled(`span`)`
  display: block;

  ${mediaQueries.md} {
    margin-right: calc(${p => p.theme.space[ICON_SIZE]} / 5);
  }

  svg {
    fill: transparent;
    height: ${p => p.theme.space[ICON_SIZE]};
    stroke: ${p => p.theme.colors.lilac};
    width: ${p => p.theme.space[ICON_SIZE]};
  }
`

export const Title = styled(`h1`)`
  color: ${p => p.theme.colors.heading};
  font-size: ${p => p.theme.fontSizes[6]};
  font-weight: ${p => p.theme.fontWeights.heading};
  margin: 0;
`

const Introduction = styled(`p`)`
  color: ${p => p.theme.colors.textMuted};
  font-size: ${p => p.theme.fontSizes[3]};
  font-family: ${p => p.theme.fonts.heading};
  margin: 0;
  margin-top: ${rhythm(4 / 5)};
`

const Actions = styled(`div`)`
  display: flex;
  flex-wrap: wrap;
  margin: ${p => p.theme.space[4]} 0 ${p => p.theme.space[6]};

  > a {
    margin-right: ${p => p.theme.space[1]};
  }

  ${mediaQueries.lg} {
    margin: ${p => p.theme.space[4]} 0 ${p => p.theme.space[8]};
  }
`

const HomepageSection = ({
  children,
  sectionName,
  sectionIcon,
  title,
  introduction,
  links,
  className,
}) => (
  <section
    sx={{
      bg: `background`,
      color: `purple.80`,
      px: 6,
      py: 5,
      width: `100%`,
      [mediaQueries.xl]: {
        my: `-1px`,
        mx: 0,
        py: 5,
        px: `5%`,
      },
      [mediaQueries.xxl]: {
        py: 7,
        px: `8%`,
      },
    }}
    className={className}
  >
    {sectionName && (
      <Header>
        <Name>
          {sectionIcon && (
            <Icon dangerouslySetInnerHTML={{ __html: sectionIcon }} />
          )}
          {sectionName}
        </Name>
        {title && <Title>{title}</Title>}
        {introduction && <Introduction>{introduction}</Introduction>}
        {links && (
          <Actions>
            {links.map(item => {
              const { to, label, icon: Icon, secondary, tracking } = item

              return (
                <Button
                  key={label}
                  to={to}
                  variant="small"
                  secondary={secondary}
                  tracking={tracking}
                >
                  {label} {Icon && <Icon />}
                </Button>
              )
            })}
          </Actions>
        )}
      </Header>
    )}
    {children}
  </section>
)

HomepageSection.propTypes = {
  children: PropTypes.node.isRequired,
  sectionName: PropTypes.string,
  sectionIcon: PropTypes.string,
  title: PropTypes.string,
  introduction: PropTypes.string,
  links: PropTypes.array,
  className: PropTypes.string,
}

export default HomepageSection
