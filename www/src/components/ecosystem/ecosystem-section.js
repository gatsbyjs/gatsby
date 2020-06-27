/** @jsx jsx */
import { jsx, Flex } from "theme-ui"
import PropTypes from "prop-types"

import Button from "../button"
import EcosystemFeaturedItems from "./ecosystem-featured-items"
import EcosystemFeaturedItem from "./ecosystem-featured-item"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const ecosystemSectionRootStyles = {
  bg: `card.background`,
  px: 6,
  mb: 3,
  [mediaQueries.md]: {
    boxShadow: `raised`,
    borderRadius: 2,
    display: `flex`,
    flexBasis: t => `calc(50% - ${t.space[5]})`,
    flexDirection: `column`,
    flexGrow: 0,
    mx: 2,
    mb: 6,
    maxHeight: `60vh`,
    p: 6,
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
}

export const Header = props => (
  <header {...props} sx={{ alignItems: `flex-start` }} />
)

const titleStyles = {
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
}

const iconStyles = {
  display: `block`,
  height: t => t.space[7],
  width: t => t.space[7],
}

const subtitleStyles = {
  color: `lilac`,
  fontSize: 1,
  fontWeight: `normal`,
  letterSpacing: `tracked`,
  m: 0,
  mt: 5,
  textTransform: `uppercase`,
}

const descriptionStyles = {
  color: `text`,
  fontSize: 2,
}

const actionsStyles = {
  flexWrap: `wrap`,
  mt: -1,
  "> a": {
    my: 1,
    mr: 2,
  },
}

const EcosystemSection = ({
  title,
  description,
  subTitle,
  icon,
  links,
  featuredItems,
  className,
}) => (
  <section sx={ecosystemSectionRootStyles} className={className}>
    <Header>
      <h1 sx={titleStyles}>
        {icon && <span sx={iconStyles}>{icon}</span>}
        <span>{title}</span>
      </h1>
      <p sx={descriptionStyles}>{description}</p>
      <Flex sx={actionsStyles}>
        {links.map(item => {
          const { to, label, secondary } = item

          return (
            <Button key={to} to={to} secondary={secondary} variant="small">
              {label}
            </Button>
          )
        })}
      </Flex>
      {subTitle && <h2 sx={subtitleStyles}>{subTitle}</h2>}
    </Header>

    {featuredItems && featuredItems.length > 0 && (
      <EcosystemFeaturedItems
        items={featuredItems}
        itemComponent={EcosystemFeaturedItem}
      />
    )}
  </section>
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
