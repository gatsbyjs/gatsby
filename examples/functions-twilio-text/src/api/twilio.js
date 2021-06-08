const message = {
  //Your authorized phone number from Twilio
  from: process.env.TWILIO_NUMBER,
}
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilio = require("twilio")(accountSid, authToken)

const handler = async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.json({ message: "Try a POST!" })
    }

    if (req.body) {
      message.body = req.body.text
      message.to = req.body.to
    }

    return twilio.messages.create(message).then(
      () => {
        return res.status(200).json({
          message: "I will send test message",
        })
      },
      error => {
        console.error(error)
        if (error.response) {
          return res.status(500).json({
            error: error.response,
          })
        }
      }
    )
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "There was an error", error: err })
  }
}

module.exports = handler
