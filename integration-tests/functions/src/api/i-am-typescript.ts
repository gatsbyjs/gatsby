import { GatsbyFunctionResponse, GatsbyFunctionRequest } from "gatsby"

export default function topLevel(
  req: GatsbyFunctionRequest,
  res: GatsbyFunctionResponse
) {
  if (req.method === `GET`) {
    res.send(`I am typescript`)
  }
}
