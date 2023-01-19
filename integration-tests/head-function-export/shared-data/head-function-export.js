const path = `/head-function-export`

const page = {
  basic: `${path}/basic/`,
  pageQuery: `${path}/page-query/`,
  reExport: `${path}/re-exported-function/`,
  staticQuery: `${path}/static-query-component/`,
  warnings: `${path}/warnings/`,
  allProps: `${path}/all-props/`,
  deduplication: `${path}/deduplication/`,
  bodyAndHtmlAttributes: `${path}/html-and-body-attributes/`,
  headWithWrapRooElement: `${path}/head-with-wrap-root-element/`,
}

const data = {
  static: {
    base: `http://localhost:8000`,
    title: `Ella Fitzgerald's Page`,
    meta: `Ella Fitzgerald`,
    noscript: `You take romance - I will take Jell-O!`,
    style: `Tahoma`,
    link: `/used-by-head-function-export-basic.css`,
    jsonLD: `{"@context":"https://schema.org","@type":"Organization","url":"https://www.spookytech.com","name":"Spookytechnologies","contactPoint":{"@type":"ContactPoint","telephone":"+5-601-785-8543","contactType":"CustomerSupport"}}`,
  },
  queried: {
    base: `http://localhost:8000`,
    title: `Nat King Cole's Page`,
    meta: `Nat King Cole`,
    noscript: `There is just one thing I cannot figure out. My income tax!`,
    style: `blue`,
    link: `/used-by-head-function-export-query.css`,
  },
  contextValues: {
    contextA: {
      name: "contextA",
      age: 1,
    },

    contextB: {
      name: "contextB",
      age: 2,
    },
  },
}
module.exports = { page, data }
