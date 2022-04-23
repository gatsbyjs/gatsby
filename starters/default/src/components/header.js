import * as React from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"

const Header = ({ siteTitle }) => (
  <header
    style={{
      marginBottom: `1.5rem`,
    }}
  >
    <div
      style={{
        margin: `0 auto`,
        maxWidth: 960,
        padding: `1.5rem 2rem`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Link
        to="/"
        style={{
          fontSize: 14,
          fontWeight: "normal",
          textDecoration: `none`,
        }}
      >
        {siteTitle}
      </Link>
      <img
        alt="Gatsby G Logo"
        height={16}
        style={{ margin: 0 }}
        src="data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 106.1 28'%3E%3Cdefs%3E%3Cstyle%3E.d%7Bfill:%237026b9;%7D%3C/style%3E%3C/defs%3E%3Cg id='a'/%3E%3Cg id='b'%3E%3Cg id='c'%3E%3Cg%3E%3Cg%3E%3Cpath class='d' d='M62.9,12h2.8v10h-2.8v-1.3c-1,1.5-2.3,1.6-3.1,1.6-3.1,0-5.1-2.4-5.1-5.3s2-5.3,4.9-5.3c.8,0,2.3,.1,3.2,1.6v-1.3h.1Zm-5.2,5c0,1.6,1.1,2.8,2.8,2.8,1.6,0,2.8-1.2,2.8-2.8s-1.1-2.8-2.8-2.8c-1.6,0-2.8,1.2-2.8,2.8Z'/%3E%3Cpath class='d' d='M71.2,14.4v7.6h-2.8v-7.6h-1.1v-2.4h1.1v-3.4h2.8v3.4h1.9v2.4h-1.9Z'/%3E%3Cpath class='d' d='M79.7,14.4c-.7-.6-1.3-.7-1.6-.7-.7,0-1.1,.3-1.1,.8,0,.3,.1,.6,.9,.9l.7,.2c.8,.3,2,.6,2.5,1.4,.3,.4,.5,1,.5,1.7,0,.9-.3,1.8-1.1,2.5-.8,.7-1.8,1.1-3,1.1-2.1,0-3.2-1-3.9-1.7l1.5-1.7c.6,.6,1.4,1.2,2.2,1.2s1.4-.4,1.4-1.1c0-.6-.5-.9-.9-1l-.6-.2c-.7-.3-1.5-.6-2.1-1.2-.5-.5-.8-1.1-.8-1.9,0-1,.5-1.8,1-2.3,.8-.6,1.8-.7,2.6-.7,.7,0,1.9,.1,3.2,1.1l-1.4,1.6Z'/%3E%3Cpath class='d' d='M85.8,13.3c1-1.4,2.4-1.6,3.2-1.6,2.9,0,4.9,2.3,4.9,5.3s-2,5.3-5,5.3c-.6,0-2.1-.1-3.2-1.6v1.3h-2.7V5.2h2.8V13.3Zm-.3,3.7c0,1.6,1.1,2.8,2.8,2.8,1.6,0,2.8-1.2,2.8-2.8s-1.1-2.8-2.8-2.8-2.8,1.2-2.8,2.8Z'/%3E%3Cpath class='d' d='M98.5,20.5l-4.8-8.5h3.3l3.1,5.7,2.8-5.7h3.2l-8,15.3h-3.2l3.6-6.8Z'/%3E%3Cpath class='d' d='M54,13.7h-7v2.8h3.7c-.6,1.9-2,3.2-4.6,3.2-2.9,0-5-2.4-5-5.3s2-5.4,4.9-5.4c1.6,0,3.2,.8,4.2,2.1l2.3-1.5c-1.5-2.1-3.9-3.3-6.5-3.3-4.4,0-8,3.6-8,8.1s3.4,8.1,8,8.1,8-3.6,8-8.1c.1-.3,0-.5,0-.7Z'/%3E%3C/g%3E%3Cpath class='d' d='M14,0C6.3,0,0,6.3,0,14s6.3,14,14,14,14-6.3,14-14S21.7,0,14,0ZM6.2,21.8c-2.1-2.1-3.2-4.9-3.2-7.6l10.9,10.8c-2.8-.1-5.6-1.1-7.7-3.2Zm10.2,2.9L3.3,11.6C4.4,6.7,8.8,3,14,3c3.7,0,6.9,1.8,8.9,4.5l-1.5,1.3c-1.7-2.3-4.4-3.8-7.4-3.8-3.9,0-7.2,2.5-8.5,6l11.5,11.5c2.9-1,5.1-3.5,5.8-6.5h-4.8v-2h7c0,5.2-3.7,9.6-8.6,10.7Z'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E"
      />
    </div>
  </header>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
