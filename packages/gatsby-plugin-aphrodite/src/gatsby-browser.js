import { StyleSheet } from 'aphrodite'

exports.onClientEntry = () => {
  if (window._aphrodite) {
    StyleSheet.rehydrate(window._aphrodite)
  }
}
