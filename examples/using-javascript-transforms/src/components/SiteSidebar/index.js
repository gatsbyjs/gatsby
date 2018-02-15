import React from "react"
import { Link } from "gatsby"
import SiteNav from "../SiteNav"
import SiteLinks from "../SiteLinks"

class SiteSidebar extends React.Component {
  render() {
    const isHome = this.props.location.pathname === `/`
    const { siteMetadata } = this.props.data.site
    // TODO, deal with image more nice like

    let header = (
      <div className="">
        <div className="card-image">
          <Link to={`/`}>
            <figure className="image">
              <img src="https://camo.githubusercontent.com/ac31ac54c2013850b0fb8a3a4926f4718a398fb3/68747470733a2f2f7777772e6761747362796a732e6f72672f6d6f6e6f6772616d2e737667" />
            </figure>
          </Link>
        </div>
        <div className="card-content">
          <p className="title">
            <Link
              style={{
                textDecoration: `none`,
                borderBottom: `none`,
                color: `inherit`,
              }}
              to={`/`}
            >
              {siteMetadata.title}
            </Link>
          </p>
          <p style={{ fontStyle: `italic` }}>{siteMetadata.siteDescr}</p>
        </div>
      </div>
    )

    return (
      <div className="card is-fullwidth">
        {header}
        <div className="card-content">
          <SiteNav {...this.props} />
          <footer>
            <div className="is-hidden-mobile">
              <SiteLinks {...this.props} />
            </div>
          </footer>
        </div>
      </div>
    )
  }
}

export default SiteSidebar
