import React from "react"
import Helmet from "react-helmet"
import SiteLinks from "../components/SiteLinks"

exports.data = {
  layoutType: `page`,
  path: `contact`,
}

class ContactMe extends React.Component {
  render() {
    return (
      <div className="container">
        <p>I would love to hear from you!</p>
        <SiteLinks {...this.props} />
      </div>
    )
  }
}

export default ContactMe
