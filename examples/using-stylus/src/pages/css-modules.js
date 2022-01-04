import React from "react"
import { Link } from "gatsby"
import * as s from "./css-modules.module.styl"

class CssModules extends React.Component {
  render() {
    return (
      <div>
        <header className={s.header}>
          <h1 className={s.theStylusClass}>Hi stylish friends</h1>
          <p>
            All the styles for this page are written using
            {` `}
            <a href="https://github.com/stylus/stylus">Stylus</a>
          </p>
          <p>
            Open the inspector and inspect the class names of these elements.
          </p>
          <Link to="/" className={s.cta}>
            View the plain example
          </Link>
        </header>
        <section className={s.main}>
          <div className={s.stylusNavExample}>
            <h2>Nav example</h2>
            <ul>
              <li>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a href="#">Store</a>
              </li>
              <li>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a href="#">Help</a>
              </li>
              <li>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a href="#">Logout</a>
              </li>
            </ul>
          </div>

          {/* This is intentionally global. See the stylus file */}
          <div className="grid">
            <div>1</div>
            <div>2</div>
            <div>2</div>
          </div>
        </section>
      </div>
    )
  }
}

export default CssModules
