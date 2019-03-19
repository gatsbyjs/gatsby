import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"

import Button from "../button"

import { rhythm, options } from "../../utils/typography"
import presets, { colors, space, breakpoints } from "../../utils/presets"

const ICON_SIZE = rhythm(space[7])

const HomepageSectionRoot = styled(`section`)`
  background: ${props => (props.inverse ? colors.gatsbyDark : colors.white)};
  color: ${props => (props.inverse ? colors.ui.light : colors.gatsbyDark)};
  padding: ${rhythm(space[5])} ${rhythm(space[6])};
  width: 100%;

  ${breakpoints.xl} {
    margin: -1px 0;
    padding: ${rhythm(space[5])} 5%;
  }

  ${breakpoints.xxl} {
    padding: ${rhythm(space[7])} 8%;
  }
`
export const Header = styled(`header`)`
  ${breakpoints.md} {
    max-width: 30rem;
  }

  ${breakpoints.lg} {
    margin-left: ${rhythm(space[9])};
  }
`

export const Name = styled(`h3`)`
  align-items: center;
  color: ${props => (props.inverse ? colors.ui.light : colors.lilac)};
  display: flex;
  font-size: ${presets.scale[2]};
  font-weight: normal;
  margin: 0;
  margin-left: calc(${ICON_SIZE} * -0.2);
  margin-bottom: 0.5em;

  ${breakpoints.md} {
    margin-left: calc(${ICON_SIZE} * -1.2);
  }
`

const Icon = styled(`span`)`
  display: block;

  ${breakpoints.md} {
    margin-right: calc(${ICON_SIZE} / 5);
  }

  svg {
    fill: transparent;
    height: ${ICON_SIZE};
    stroke: ${props => (props.inverse ? colors.ui.light : colors.lilac)};
    width: ${ICON_SIZE};
  }
`

export const Title = styled(`h1`)`
  color: ${props => (props.inverse ? colors.lemon : colors.gatsby)};
  font-size: ${presets.scale[6]};
  margin: 0;
`

const Introduction = styled(`p`)`
  color: ${props => (props.inverse ? colors.ui.light : colors.gatsbyDark)};
  font-size: ${presets.scale[3]};
  font-family: ${options.headerFontFamily.join(`,`)};
  margin: 0;
  margin-top: ${rhythm(4 / 5)};
`

const Actions = styled(`div`)`
  display: flex;
  flex-wrap: wrap;
  margin: ${rhythm(space[4])} 0 ${rhythm(space[6])};

  > a {
    margin-right: ${rhythm(space[1])};
  }

  ${breakpoints.lg} {
    margin: ${rhythm(space[4])} 0 ${rhythm(space[8])};
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
            {links.map((item, idx) => {
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
