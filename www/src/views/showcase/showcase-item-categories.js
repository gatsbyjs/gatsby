import React, { Fragment } from "react"
import { Link } from "gatsby"
import qs from "qs"

import URLQuery from "../../components/url-query"
import { colors } from "../../utils/presets"

const ScrollToLink = ({ onClickHandler, category, showcase, ...rest }) => (
  <URLQuery>
    {(_, updateQuery) => (
      <a
        href="#showcase"
        onClick={onClickHandler(showcase, updateQuery, category)}
        {...rest}
      >
        {category}
      </a>
    )}
  </URLQuery>
)

const ShowcaseItemCategories = ({ categories, onClickHandler, showcase }) => {
  const LinkComponent = onClickHandler ? ScrollToLink : Link

  return categories.map((c, i) => (
    <Fragment key={c}>
      <LinkComponent
        css={{
          "&&": {
            color: colors.gray.bright,
            fontWeight: `normal`,
            borderBottom: `none`,
            boxShadow: `none`,
            "&:hover": {
              background: `none`,
              color: colors.gatsby,
            },
          },
        }}
        to={`/showcase?${qs.stringify({
          filters: [c],
        })}`}
        onClickHandler={onClickHandler}
        showcase={showcase}
        category={c}
      >
        {c}
      </LinkComponent>
      {i === categories.length - 1 ? `` : `, `}
    </Fragment>
  ))
}

export default ShowcaseItemCategories
