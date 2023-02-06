const path = `/head-function-export`

const page = {
  basic: `${path}/basic/`,
  pageQuery: `${path}/page-query/`,
  reExport: `${path}/re-exported-function/`,
  staticQuery: `${path}/static-query-component/`,
  warnings: `${path}/warnings/`,
  correctProps: `${path}/correct-props/`,
  dsg: `${path}/dsg/`,
  ssr: `${path}/ssr/`,
  invalidElements: `${path}/invalid-elements/`,
  fsRouteApi: `${path}/fs-route-api/`,
  deduplication: `${path}/deduplication/`,
  htmlAndBodyAttributes: `${path}/html-and-body-attributes/`,
  headWithWrapRooElement: `${path}/head-with-wrap-root-element/`,
}

const data = {
  static: {
    base: `http://localhost:8000`,
    title: `Ella Fitzgerald's Page`,
    meta: `Ella Fitzgerald`,
    noscript: `You take romance - I will take Jell-O!`,
    style: `rebeccapurple`,
    link: `/used-by-head-function-export-basic.css`,
    extraMeta: `Extra meta tag that should be removed during navigation`,
    jsonLD: `{"@context":"https://schema.org","@type":"Organization","url":"https://www.spookytech.com","name":"Spookytechnologies","contactPoint":{"@type":"ContactPoint","telephone":"+5-601-785-8543","contactType":"CustomerSupport"}}`,
  },
  queried: {
    base: `http://localhost:8000`,
    title: `Nat King Cole's Page`,
    meta: `Nat King Cole`,
    noscript: `There is just one thing I cannot figure out. My income tax!`,
    style: `blue`,
    link: `/used-by-head-function-export-query.css`,
    extraMeta2: `Extra meta tag that should be added during navigation`,
  },
  dsg: {
    base: `http://localhost:8000`,
    title: `Louis Armstrong's Page`,
    meta: `Louis Armstrong`,
    noscript: `What we play is life`,
    style: `orange`,
    link: `/used-by-head-function-export-dsg.css`,
  },
  ssr: {
    base: `http://localhost:8000`,
    title: `Frank Sinatra's Page`,
    meta: `Frank Sinatra`,
    noscript: `You may be a puzzle, but I like the way the parts fit`,
    style: `green`,
    link: `/used-by-head-function-export-ssr.css`,
    serverData: { hello: `world` },
  },
  invalidElements: {
    title: `I should actually be inserted, unlike the others`,
  },
  fsRouteApi: {
    slug: `/fs-route-api`,
  },
  pageContext: {
    key: "value",
    someKey: "someValue",
  },
}

module.exports = { page, data }
