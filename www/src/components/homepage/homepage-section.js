/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
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
  color: ${props =>
    props.inverse ? props.theme.colors.purple[10] : props.theme.colors.lilac};
  display: flex;
  font-size: ${p => p.theme.fontSizes[2]};
  font-weight: ${p => p.theme.fontWeights[0]};
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
    margin-right: calc(${ICON_SIZE} / 5);
  }

  svg {
    fill: transparent;
    height: ${ICON_SIZE};
    stroke: ${props =>
      props.inverse ? props.theme.colors.purple[10] : props.theme.colors.lilac};
    width: ${ICON_SIZE};
  }
`

export const Title = styled(`h1`)`
  color: ${props =>
    props.inverse ? props.theme.colors.yellow[40] : props.theme.colors.gatsby};
  font-size: ${p => p.theme.fontSizes[6]};
  font-weight: ${p => p.theme.fontWeights[1]};
  margin: 0;
`

const Introduction = styled(`p`)`
  color: ${props =>
    props.inverse
      ? props.theme.colors.purple[10]
      : props.theme.colors.purple[80]};
  font-size: ${p => p.theme.fontSizes[3]};
  font-family: ${p => p.theme.fonts.header};
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
  inverseStyle,
  links,
  inverse,
  className,
}) => (
  <section
    sx={{
      bg: inverse ? `purple.80` : `background`,
      color: inverse ? `purple.10` : `purple.80`,
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
    inverse={inverseStyle}
    className={className}
  >
    {sectionName && (
      <Header>
        <Name inverse={inverseStyle}>
          {sectionIcon && (
            <Icon
              dangerouslySetInnerHTML={{ __html: sectionIcon }}
              inverse={inverseStyle}
            />
          )}
          {sectionName}
        </Name>
        {title && <Title inverse={inverseStyle}>{title}</Title>}
        {introduction && (
          <Introduction inverse={inverseStyle}>{introduction}</Introduction>
        )}
        {links && (
          <Actions>
            {links.map(item => {
              const { to, label, icon: Icon, secondary, tracking } = item

              return (
                <Button
                  key={label}
                  to={to}
                  small
                  ondark={inverseStyle ? true : false}
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
  inverseStyle: PropTypes.bool,
  className: PropTypes.string,
}

export default HomepageSection
