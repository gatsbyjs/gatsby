import React from "react"

class RouteAnnouncer extends React.Component {
  constructor(props) {
    super(props)
    this.announcementRef = React.createRef()
  }

  componentDidUpdate(prevProps, nextProps) {
    requestAnimationFrame(() => {
      let pageName = `new page at ${this.props.location.pathname}`
      if (document.title) {
        pageName = document.title
      }
      const pageHeadings = document
        .getElementById(`gatsby-focus-wrapper`)
        .getElementsByTagName(`h1`)
      if (pageHeadings && pageHeadings.length) {
        pageName = pageHeadings[0].textContent
      }
      const newAnnouncement = `Navigated to ${pageName}`
      const oldAnnouncement = this.announcementRef.current.innerText
      if (oldAnnouncement !== newAnnouncement) {
        this.announcementRef.current.innerText = newAnnouncement
      }
    })
  }

  render() {
    return (
      <div
        id="gatsby-announcer"
        style={{
          position: `absolute`,
          top: 0,
          width: 1,
          height: 1,
          padding: 0,
          overflow: `hidden`,
          clip: `rect(0, 0, 0, 0)`,
          whiteSpace: `nowrap`,
          border: 0,
        }}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        ref={this.announcementRef}
      ></div>
    )
  }
}

export { RouteAnnouncer }
