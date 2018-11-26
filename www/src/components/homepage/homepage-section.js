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
  padding: ${rhythm(2)} ${rhythm(presets.gutters.default / 2)};
  width: calc(100% + ${rhythm(presets.gutters.default)});

  ${presets.Hd} {
    margin: 0 -${vP};
    width: calc(100% + (${vP} * 2));
  }

  ${presets.VHd} {
    padding: ${rhythm(2)} 5%;
  }
`
const Header = styled(`header`)`
  ${presets.Tablet} {
    margin-left: 3rem;
    max-width: 30rem;
  }

  ${presets.Desktop} {
    margin-left: 6rem;
  }
`

const Name = styled(`h3`)`
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
    height: ${ICON_SIZE};
    stroke: ${props => (props.inverse ? colors.ui.light : colors.lilac)};
    width: ${ICON_SIZE};
  }
`

const Title = styled(`h1`)`
  color: ${props => (props.inverse ? colors.lemon : colors.gatsby)};
  font-size: 1.75rem;
  margin: 0;
  margin-bottom: 0.5em;
`

const Introduction = styled(`p`)`
  color: ${props => (props.inverse ? colors.ui.light : colors.gatsbyDark)};
  font-size: 1.125rem;
  font-family: ${options.headerFontFamily.join(`,`)};
  margin-bottom: 0;
`

const Actions = styled(`div`)`
  display: flex;
  flex-wrap: wrap;
  margin-top: -${rhythm(1 / 4)};

  > a {
    margin: ${rhythm(1.2)} 0 ${rhythm(1.5)};
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
}) => (
  <HomepageSectionRoot inverse={inverseStyle}>
    <Header>
      {sectionName && (
        <Name inverse={inverseStyle}>
          {sectionIcon && (
            <Icon
              dangerouslySetInnerHTML={{ __html: sectionIcon }}
              inverse={inverseStyle}
            />
          )}
          {sectionName}
        </Name>
      )}
      {title && <Title inverse={inverseStyle}>{title}</Title>}
      {introduction && (
        <Introduction inverse={inverseStyle}>{introduction}</Introduction>
      )}
      <Actions>
        {links.map((item, idx) => {
          const { to, label, icon: Icon } = item

          return (
            <Button key={label} to={to} ondark small>
              {label} {Icon && <Icon />}
            </Button>
          )
        })}
      </Actions>
    </Header>
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
}

export default HomepageSection
