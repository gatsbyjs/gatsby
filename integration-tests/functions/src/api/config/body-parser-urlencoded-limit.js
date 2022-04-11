import { inspect } from "util"

export default function bodyParserUrlUncodedLimit(req, res) {
  res.send({
    body: inspect(req.body, {
      depth: Infinity,
      maxStringLength: 100,
    }),
  })
}

export const config = {
  bodyParser: {
    urlencoded: {
      limit: `100mb`,
      extended: true,
    },
  },
}
