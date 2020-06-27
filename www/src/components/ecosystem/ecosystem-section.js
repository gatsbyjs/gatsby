/** @jsx jsx */
import { jsx } from "theme-ui"
import PropTypes from "prop-types"
import { Heading, Flex } from "theme-ui"

import Button from "../button"
import EcosystemFeaturedItems from "./ecosystem-featured-items"
import EcosystemFeaturedItem from "./ecosystem-featured-item"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const EcosystemSectionRoot = props => (
  <section
    {...props}
    sx={{
      bg: `card.background`,
      p: 6,
      mb: 3,

      [mediaQueries.md]: {
        boxShadow: `raised`,
        borderRadius: 2,
        display: `flex`,
        flexBasis: t => `calc(50% - ${t.space[5]})`,
        flexDirection: `column`,
        flexGrow: 0,
        mt: 0,
        mx: 2,
        mb: 6,
        maxHeight: `60vh`,
        pb: 0,

        ":last-child": {
          flexGrow: 1,
        },
      },

      [mediaQueries.lg]: {
        flexBasis: t => `calc(33.33% - ${t.space[5]})`,
        maxHeight: `100%`,

        ":last-child": {
          alignSelf: `flex-start`,
          pb: 6,
        },
      },

      a: {
        textDecoration: `none`,
      },
    }}
  />
)

export const Header = props => (
  <header {...props} sx={{ alignItems: `flex-start` }} />
)

const Title = props => (
  <Heading
    {...props}
    as="h1"
    sx={{
      alignItems: `center`,
      color: `heading`,
      display: `flex`,
      fontSize: 4,
      fontWeight: `heading`,
      lineHeight: `solid`,
      m: 0,
      mb: 1,
      minHeight: t => t.space[7],

      span: {
        mr: 1,
      },
    }}
  />
)

const Icon = props => (
  <span
    {...props}
    sx={{
      display: `block`,
      height: t => t.space[7],
      width: t => t.space[7],
    }}
  />
)

const SubTitle = props => (
  <Heading
    {...props}
    sx={{
      color: `lilac`,
      fontSize: 1,
      fontWeight: `normal`,
      letterSpacing: `tracked`,
      m: 0,
      mt: 5,
      textTransform: `uppercase`,
    }}
  />
)

const Description = props => (
  <p
    {...props}
    sx={{
      color: `text`,
      fontSize: 2,
    }}
  />
)

const Actions = props => (
  <Flex
    {...props}
    sx={{
      flexWrap: `wrap`,
      mt: -1,

      "> a": {
        my: 1,
        mr: 2,
      },
    }}
  />
)

const EcosystemSection = ({
  title,
  description,
  subTitle,
  icon,
  links,
  featuredItems,
  className,
}) => (
  <EcosystemSectionRoot className={className}>
    <Header>
      <Title>
        {icon && <Icon>{icon}</Icon>}
        <span>{title}</span>
      </Title>
      <Description>{description}</Description>
      <Actions>
        {links.map(item => {
          const { to, label, secondary } = item

          return (
            <Button key={to} to={to} secondary={secondary} variant="small">
              {label}
            </Button>
          )
        })}
      </Actions>
      {subTitle && <SubTitle>{subTitle}</SubTitle>}
    </Header>

    {featuredItems && featuredItems.length > 0 && (
      <EcosystemFeaturedItems
        items={featuredItems}
        itemComponent={EcosystemFeaturedItem}
      />
    )}
  </EcosystemSectionRoot>
)

EcosystemSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  className: PropTypes.string,
  subTitle: PropTypes.string,
  icon: PropTypes.element,
  links: PropTypes.array,
  featuredItems: PropTypes.array,
}

export default EcosystemSection
