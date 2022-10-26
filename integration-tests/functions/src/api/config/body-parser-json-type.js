import { inspect } from "util"

export default function bodyParserJsonType(req, res) {
  res.send({
    body: inspect(req.body, { depth: Infinity, maxStringLength: 100 }),
  })
}

export const config = {
  bodyParser: {
    json: {
      type: `*/*`,
    },
  },
}
