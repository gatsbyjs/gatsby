import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"

import Button from "../button"

import { rhythm } from "../../utils/typography"
import {
  colors,
  space,
  mediaQueries,
  fontSizes,
  fonts,
  fontWeights,
} from "../../utils/presets"

const ICON_SIZE = space[7]

const HomepageSectionRoot = styled(`section`)`
  background: ${props => (props.inverse ? colors.purple[80] : colors.white)};
  color: ${props => (props.inverse ? colors.purple[10] : colors.purple[80])};
  padding: ${space[5]} ${space[6]};
  width: 100%;

  ${mediaQueries.xl} {
    margin: -1px 0;
    padding: ${space[5]} 5%;
  }

  ${mediaQueries.xxl} {
    padding: ${space[7]} 8%;
  }
`
export const Header = styled(`header`)`
  ${mediaQueries.md} {
    max-width: 30rem;
  }

  ${mediaQueries.lg} {
    margin-left: ${space[9]};
  }
`

export const Name = styled(`h3`)`
  align-items: center;
  color: ${props => (props.inverse ? colors.purple[10] : colors.lilac)};
  display: flex;
  font-size: ${fontSizes[2]};
  font-weight: ${fontWeights[0]};
  margin: 0;
  margin-left: calc(${ICON_SIZE} * -0.2);
  margin-bottom: 0.5em;

  ${mediaQueries.lg} {
    margin-left: calc(${ICON_SIZE} * -1.2);
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
    stroke: ${props => (props.inverse ? colors.purple[10] : colors.lilac)};
    width: ${ICON_SIZE};
  }
`

export const Title = styled(`h1`)`
  color: ${props => (props.inverse ? colors.yellow[40] : colors.gatsby)};
  font-size: ${fontSizes[6]};
  font-weight: ${fontWeights[1]};
  margin: 0;
`

const Introduction = styled(`p`)`
  color: ${props => (props.inverse ? colors.purple[10] : colors.purple[80])};
  font-size: ${fontSizes[3]};
  font-family: ${fonts.header};
  margin: 0;
  margin-top: ${rhythm(4 / 5)};
`

const Actions = styled(`div`)`
  display: flex;
  flex-wrap: wrap;
  margin: ${space[4]} 0 ${space[6]};

  > a {
    margin-right: ${space[1]};
  }

  ${mediaQueries.lg} {
    margin: ${space[4]} 0 ${space[8]};
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
  className,
}) => (
  <HomepageSectionRoot inverse={inverseStyle} className={className}>
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
  </HomepageSectionRoot>
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
