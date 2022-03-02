const { causeSegfault } = require("segfault-handler")

exports.onPreBuild = () => {
  causeSegfault()
}
