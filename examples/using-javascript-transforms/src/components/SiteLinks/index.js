import React from "react"
import PropTypes from "prop-types"
import "./style.css"
import "../../static/fonts/fontawesome/style.css"

function SiteLinks({data}) {
  static propTypes = {
    data: PropTypes.shape({
      site: PropTypes.shape({
        siteMetadata: PropTypes.object.isRequired,
      }),
    }),
  }

  const { siteMetadata } = data.site

return (
<div className="blog-social">
<ul>
<li>
<a href={`mailto:` + siteMetadata.siteEmailUrl}>
<i className="fa fa-envelope-o" /> {siteMetadata.siteEmailPretty}
</a>
</li>
<li>
<a href={siteMetadata.siteTwitterUrl}>
<i className="fa fa-twitter" /> {siteMetadata.siteTwitterPretty}
</a>
</li>
</ul>
</div>
);
}

export default SiteLinks
