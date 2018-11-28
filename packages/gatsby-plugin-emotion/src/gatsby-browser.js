/* globals window */
import { hydrate } from "emotion"
import { wrapElement } from "./wrap-element"

exports.onClientEntry = () => {
  if (
    typeof window !== `undefined` &&
    typeof window.__EMOTION_CRITICAL_CSS_IDS__ !== `undefined`
  ) {
    hydrate(window.__EMOTION_CRITICAL_CSS_IDS__)
  }
}

exports.wrapRootElement = ({ element }) => wrapElement(element)
