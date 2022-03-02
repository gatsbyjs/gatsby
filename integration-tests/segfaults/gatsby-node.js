const { causeSegfault } = require("segfault-handler")

exports.onCreatePage = () => {
  causeSegfault()
}
