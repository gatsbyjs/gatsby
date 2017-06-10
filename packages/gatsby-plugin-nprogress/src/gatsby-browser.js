import "nprogress/nprogress.css"
import NProgress from "nprogress"

exports.onClientEntry = () => {
  window.___emitter.on(`onDelayedLoadPageResources`, () => {
    NProgress.start()
  })
  window.___emitter.on(`onPostLoadPageResources`, () => {
    NProgress.done()
  })
}
