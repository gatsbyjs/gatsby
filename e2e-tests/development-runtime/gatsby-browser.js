if (typeof window !== `undefined`) {
  window.___PageComponentLifecycleCallsLog = []
}

const addLogEntry = (action, location) => {
  window.___PageComponentLifecycleCallsLog.push({
    action,
    pathname: location.pathname,
  })
}

exports.onPreRouteUpdate = ({ location }) => {
  addLogEntry(`onPreRouteUpdate`, location)
}

exports.onRouteUpdate = ({ location }) => {
  addLogEntry(`onRouteUpdate`, location)
}

exports.onPrefetchPathname = ({ pathname }) => {
  addLogEntry(`onPrefetchPathname`, pathname)
}
