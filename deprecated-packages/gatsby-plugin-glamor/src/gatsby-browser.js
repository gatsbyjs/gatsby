import { rehydrate } from "glamor"

exports.onClientEntry = () => {
  if (window._glamor) {
    rehydrate(window._glamor)
  }
}
