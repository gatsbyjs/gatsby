const path = `/head-function-export`

const page = {
  basic: `${path}/basic`,
  pageQuery: `${path}/page-query`,
  reExport: `${path}/re-exported-function`,
  staticQuery: `${path}/static-query-component`,
  staticQueryOverride: `${path}/static-query-component-override`,
  warnings: `${path}/warnings`,
  allProps: `${path}/all-props`,
}

const data = {
  static: {
    base: `http://localhost:8000`,
    title: `Ella Fitzgerald's Page`,
    meta: `Ella Fitzgerald`,
    noscript: `You take romance - I'll take Jell-O!`,
    style: `rebeccapurple`,
    link: `/used-by-head-function-export-basic.css`,
  },
  queried: {
    base: `http://localhost:8000`,
    title: `Nat King Cole's Page`,
    meta: `Nat King Cole`,
    noscript: `There's just one thing I can't figure out. My income tax!`,
    style: `blue`,
    link: `/used-by-head-function-export-query.css`,
  },
}

module.exports = { page, data }
