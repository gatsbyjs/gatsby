import { GatsbyAPIFunctionResponse, GatsbyAPIFunctionRequest } from "gatsby"

export default function topLevel(
  req: GatsbyAPIFunctionRequest,
  res: GatsbyAPIFunctionResponse
) {
  res.redirect(`/`)
}
