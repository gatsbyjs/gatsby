module.exports = {
  envinfoConfirmation: {
    type: `confirm`,
    name: `envinfoConfirmation`,
    message: `Automatically add non-sensitive information about your environment?`,
    default: true,
  },
  filesConfirmation: {
    type: `confirm`,
    name: `filesConfirmation`,
    message: `Automatically add content of Gatsby configuration files?`,
    default: false,
  },
}
