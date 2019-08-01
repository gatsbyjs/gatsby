import React, { Fragment } from "react"
import { Link } from "gatsby"
import qs from "qs"
import { colors } from "../../utils/presets"

const ScrollToLink = ({ to, ...rest }) => <a href={to} {...rest} />

const ShowcaseItemCategories = ({ categories, onCategoryClick }) => {
  const LinkComponent = onCategoryClick ? ScrollToLink : Link

  return categories.map((c, i) => (
    <Fragment key={c}>
      <LinkComponent
        css={{
          "&&": {
            color: colors.text.secondary,
            fontWeight: `normal`,
            borderBottom: `none`,
            "&:hover": {
              color: colors.gatsby,
            },
          },
        }}
        to={`/showcase?${qs.stringify({
          filters: [c],
        })}`}
        onClick={e => {
          e.preventDefault()
          if (onCategoryClick) {
            onCategoryClick(c)
          }
        }}
        category={c}
      >
        {c}
      </LinkComponent>
      {i === categories.length - 1 ? `` : `, `}
    </Fragment>
  ))
}

export default ShowcaseItemCategories
