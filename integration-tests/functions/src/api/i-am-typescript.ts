import { GatsbyAPIFunctionResponse, GatsbyAPIFunctionRequest } from "gatsby"

export default function topLevel(
  req: GatsbyAPIFunctionRequest,
  res: GatsbyAPIFunctionResponse
) {
  if (req.method === `GET`) {
    res.send(`I am typescript`)
  }
}
