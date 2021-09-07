import React from "react"
import { Link } from "gatsby"
import {
  header,
  header__wrap,
  header__heading,
  header__nav,
  header__link,
  header__linkHome,
} from "./header.module.css"

const Header = () => (
  <header className={header}>
    <div className={header__wrap}>
      <h1 className={header__heading}>
        <Link to="/" className={`${header__link} ${header__linkHome}`}>
          Gatsby Auth
        </Link>
      </h1>
      <nav role="main" className={header__nav}>
        <Link to="/" className={header__link}>
          Home
        </Link>
        <Link to="/app/profile" className={header__link}>
          Profile
        </Link>
        <Link to="/app/details" className={header__link}>
          Details
        </Link>
      </nav>
    </div>
  </header>
)

export default Header
