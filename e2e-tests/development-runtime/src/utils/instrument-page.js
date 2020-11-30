import React from "react"

const InstrumentPage = Page =>
  class extends React.Component {
    addLogEntry(action) {
      if (typeof window !== `undefined`) {
        window.___PageComponentLifecycleCallsLog.push({
          action,
          pageComponent: this.props.pageResources.page.componentChunkName,
          locationPath: this.props.location.pathname,
          pagePath: this.props.pageResources.page.path,
        })
      }
    }

    constructor(props) {
      super(props)
      this.addLogEntry(`constructor`)
    }

    componentDidMount() {
      this.addLogEntry(`componentDidMount`)
    }

    componentWillUnmount() {
      this.addLogEntry(`componentWillUnmount`)
    }

    render() {
      this.addLogEntry(`render`)
      return <Page {...this.props} />
    }
  }

export default InstrumentPage
