import React from "react"

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
