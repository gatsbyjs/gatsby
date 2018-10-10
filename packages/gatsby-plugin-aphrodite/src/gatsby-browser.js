import { StyleSheet } from 'aphrodite'

exports.onClientEntry = () => {
  if (
    typeof window !== `undefined` &&
    typeof window.__APHRODITE_CLASS_NAMES__ !== `undefined`
  ) {
    StyleSheet.rehydrate(window.__APHRODITE_CLASS_NAMES__)
  }
}