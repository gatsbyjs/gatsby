import React from "react"
import PropTypes from "prop-types"
import Link from "gatsby-link"
import { H1, H2, H3, H4 } from "../components/styled"
import { Row, Page, Column } from "./styled"

const Header = ({ title, subtitle, pages }) => (
  // TODO : Sort order of menu based on field menu_order
  <Page>
    <Row>
      <H3>{title}</H3>
    </Row>
    <Row>
      <H4>{subtitle}</H4>
    </Row>
    <Row>
      <Column fluid xs={1} sm={10} md={10} lg={10}>
        <span>
          <Link to={`/`}>Home</Link> -{` `}
        </span>
        {pages.edges.map((p, i) => {
          if (p.node.slug == `blog`) return
          if (p.node.slug == `home`) return
          return (
            <span key={p.node.id}>
              {i !== 0 ? ` - ` : ``}
              <Link to={`/${p.node.slug}`}>{unescape(p.node.title)}</Link>
            </span>
          )
        })}
      </Column>
      <hr />
    </Row>
  </Page>
)

Header.propTypes = {
  title: PropTypes.string,
  pages: PropTypes.object.isRequired,
}

export default Header
