if (typeof window !== `undefined`) {
  window.___PageComponentLifecycleCallsLog = []
}

const addLogEntry = (action, location) => {
  const idElement = document.querySelector(`[data-testid="dom-marker"]`)
  window.___PageComponentLifecycleCallsLog.push({
    action,
    pathname: location.pathname,
    domContent: idElement ? idElement.innerText : null,
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
