import React from "react"
import Link from "gatsby-link"
import SiteNav from "../SiteNav"
import SiteLinks from "../SiteLinks"

class SiteSidebar extends React.Component {
    render() {
        const isHome = this.props.location.pathname === ('/');
        const siteMetadata = this.props.siteMetadata;
        // TODO, deal with image more nice like

    let header = (
      <div className="">
        <div className="card-image">
          <Link to={`/`}>
            <figure className="image">
              <img src="https://camo.githubusercontent.com/9c70ec950802d744cd3bccaa97fadbfdd7c8f2a9/68747470733a2f2f7777772e6761747362796a732e6f72672f6761747362792d6e656761746976652e737667" />
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
          <p style={{ fontStyle: `italic` }}>
            {siteMetadata.siteDescr}
          </p>
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
            <div>
              <p className="copyright">&copy; All rights reserved.</p>
              <p className="copyright">
                Made with <i className="fa fa-heart" aria-hidden="true" /> by{` `}
                <Link to={siteMetadata.siteTwitterUrl}>Jacob Bolda</Link>
              </p>
            </div>
          </footer>
        </div>
      </div>
    )
  }
}

export default SiteSidebar
