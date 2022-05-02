import { inspect } from "util"

export default function bodyParserTextLimit(req, res) {
  res.send({
    body: inspect(req.body, { depth: Infinity, maxStringLength: 100 }),
  })
}

export const config = {
  bodyParser: {
    text: {
      limit: `100mb`,
    },
  },
}
