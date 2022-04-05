import * as React from "react"

function InstrumentPage(Component) {
  return function WithInstrumentPageComponent({ ...props }) {
    function addLogEntry(action) {
      if (typeof window !== `undefined`) {
        window.___PageComponentLifecycleCallsLog.push({
          action,
          pageComponent: props.pageResources.page.componentChunkName,
          locationPath: props.location.pathname,
          pagePath: props.pageResources.page.path,
        })
      }
    }
  
    React.useEffect(() => {
      addLogEntry(`componentDidMount`)
      return () => {
        addLogEntry(`componentWillUnmount`)
      }
    }, [])
  
    addLogEntry(`render`)
  
    return <Component {...props} />
  }
}

export default InstrumentPage
