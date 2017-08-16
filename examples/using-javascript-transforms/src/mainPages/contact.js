import React from "react"
import Helmet from "react-helmet"
import SiteLinks from "../components/SiteLinks"

exports.data = {
  layoutType: `page`,
  path: `/contact/`,
}

class ContactMe extends React.Component {
  render() {
    return (
      <div className="box container">
        <p>I would love to hear from you!</p>
      </div>
    )
  }
}

export default ContactMe
