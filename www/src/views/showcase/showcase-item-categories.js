/** @jsx jsx */
import { jsx } from "theme-ui"
import { Fragment } from "react"
import { Link } from "gatsby"
import qs from "qs"

const ScrollToLink = ({ to, ...rest }) => <a href={to} {...rest} />

const ShowcaseItemCategories = ({ categories, onCategoryClick }) => {
  const LinkComponent = onCategoryClick ? ScrollToLink : Link

  return categories.map((c, i) => (
    <Fragment key={c}>
      <LinkComponent
        sx={{
          "&&": {
            color: `textMuted`,
            fontWeight: `body`,
            borderBottom: `none`,
            "&:hover": {
              color: `link.hoverColor`,
            },
          },
        }}
        to={`/showcase/?${qs.stringify({
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
