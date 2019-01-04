import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"

import Button from "../button"

import { rhythm, options } from "../../utils/typography"
import { vP } from "../gutters"
import presets, { colors } from "../../utils/presets"

const ICON_SIZE = `32px`

const HomepageSectionRoot = styled(`section`)`
  background: ${props => (props.inverse ? colors.gatsby : `#fff`)};
  color: ${props => (props.inverse ? colors.ui.light : colors.gatsbyDark)};
  margin: 0 -${rhythm(presets.gutters.default / 2)};
  padding: ${rhythm(1)} ${rhythm(presets.gutters.default / 2)};
  width: calc(100% + ${rhythm(presets.gutters.default)});

  ${presets.Hd} {
    margin: -1px -${vP};
    padding: ${rhythm(1)} 5%;
    width: calc(100% + (${vP} * 2));
  }

  ${presets.VHd} {
    padding: ${rhythm(1.5)} 8%;
  }
`
export const Header = styled(`header`)`
  ${presets.Tablet} {
    max-width: 30rem;
  }

  ${presets.Desktop} {
    margin-left: 3rem;
  }
`

export const Name = styled(`h3`)`
  align-items: center;
  color: ${props => (props.inverse ? colors.ui.light : colors.lilac)};
  display: flex;
  font-size: 1rem;
  font-weight: normal;
  margin: 0;
  margin-left: calc(${ICON_SIZE} * -0.2);
  margin-bottom: 0.5em;

  ${presets.Tablet} {
    margin-left: calc(${ICON_SIZE} * -1.2);
  }
`

const Icon = styled(`span`)`
  display: block;

  ${presets.Tablet} {
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
  font-size: 1.75rem;
  margin: 0;
`

const Introduction = styled(`p`)`
  color: ${props => (props.inverse ? colors.ui.light : colors.gatsbyDark)};
  font-size: 1.125rem;
  font-family: ${options.headerFontFamily.join(`,`)};
  margin: 0;
  margin-top: ${rhythm(4 / 5)};
`

const Actions = styled(`div`)`
  display: flex;
  flex-wrap: wrap;
  margin: 1rem 0 1.5rem;

  > a {
    margin-right: ${rhythm(0.2)};
  }

  ${presets.Desktop} {
    margin: 1rem 0 2.5rem;
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
              const { to, label, icon: Icon, secondary } = item

              return (
                <Button
                  key={label}
                  to={to}
                  small
                  ondark={inverseStyle ? true : false}
                  secondary={secondary}
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
