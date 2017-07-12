import React from "react"
import Link from 'gatsby-link'
import s from "./css-modules.module.styl"

class CssModules extends React.Component {
  render() {
    return (
      <div>
        <header className={s.header}>
          <h1 className={s["the-stylus-class"]}>Hi stylish friends</h1>
          <p>
            All the styles for this page are written using <a href="https://github.com/stylus/stylus">Stylus</a>
          </p>
          <p>Open the inspector and inspect the class names of these elements.</p>
          <Link to="/" className={s.cta}>View the plain example</Link>
        </header>
        <section className={s.main}>
          <div className={s["stylus-nav-example"]}>
            <h2>Nav example</h2>
            <ul>
              <li>
                <a href="#">Store</a>
              </li>
              <li>
                <a href="#">Help</a>
              </li>
              <li>
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
