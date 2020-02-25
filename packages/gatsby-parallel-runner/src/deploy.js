const GooglePubSub = require("./processor-queue/implementations/google-functions/deploy")

exports.deploy = async function() {
  try {
    await GooglePubSub.deploy()
  } catch (err) {
    console.error("Failed to deploy parallel functions", err)
    process.exit(1)
  }
}
