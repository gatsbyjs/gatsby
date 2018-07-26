import React, { Fragment } from "react"
import { Link } from "gatsby"
import qs from "qs"

import { colors } from "../../utils/presets"

const ShowcaseItemCategories = ({ categories }) =>
  categories.map((c, i) => (
    <Fragment key={c}>
      <Link
        className="category__link"
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
      >
        {c}
      </Link>
      {i === categories.length - 1 ? `` : `, `}
    </Fragment>
  ))

export default ShowcaseItemCategories
