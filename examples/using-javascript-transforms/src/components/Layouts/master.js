import React from "react"
import { Helmet } from "react-helmet"
import "../../static/css/base.scss"

function MasterLayout({data, children}) {
  let siteMetadata = data.site.siteMetadata

return (
<div className="MasterLayout">
<Helmet defaultTitle={siteMetadata.title}>
<meta name="description" content={siteMetadata.siteDescr} />
<meta name="keywords" content="articles" />
</Helmet>
{children}
</div>
);
}

export default MasterLayout
