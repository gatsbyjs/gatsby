import { rehydrate } from "glamor"

exports.clientEntry = () => {
  if (window._glamor) {
    rehydrate(window._glamor)
  }
}
