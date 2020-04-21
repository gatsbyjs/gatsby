import loadable from "@loadable/component"

const LazyModal = loadable(async () => {
  const Module = await import(`react-modal`)
  const Modal = Module.default
  // http://reactcommunity.org/react-modal/accessibility/
  Modal.setAppElement(`#___gatsby`)
  return Modal
})

export default LazyModal
