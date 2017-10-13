import React from "react"
import * as PropTypes from "prop-types"
import Helmet from "react-helmet"
import "../static/css/base.scss"

class MasterLayout extends React.Component {
  render() {
    let siteMetadata = this.props.data.site.siteMetadata
    let location = this.props.location.pathname

    return (
      <div className="MasterLayout">
        <Helmet
          defaultTitle={siteMetadata.title}
          meta={[
            { name: `description`, content: siteMetadata.siteDescr },
            { name: `keywords`, content: `articles` },
          ]}
        />
        {this.props.children}
      </div>
    )
  }
}

export default MasterLayout
