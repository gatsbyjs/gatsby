const { GoogleSpreadsheet } = require("google-spreadsheet")

const handler = async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.json({ message: "Try a POST!" })
    }

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID)

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, "\n"),
    })
    await doc.getInfo()

    // Always use the first sheet.
    const sheet = doc.sheetsByIndex[0]

    // If not set yet (sheet is empty), add the headers.
    if (!sheet.headerValues) {
      await sheet.setHeaderRow([`name`, `snack`, `drink`])
    }

    var count = 0
    var rows = []
    for (element in req.body) {
      if (element == "name" + count) {
        rows.push({
          name: req.body[element],
          snack: req.body["snack" + count],
          drink: req.body["drink" + count],
        })
        count++
      }
    }

    return await sheet.addRows(rows).then(
      value => {
        return res.status(200).json({
          message: "Pushing rows to new sheet",
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
