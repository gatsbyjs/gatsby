type RootQuery = {
  name: string
  path: string
  text: string
  originalText: string
  isStaticQuery: boolean
  hash: string
}

type Queries = Map<string, RootQuery>
