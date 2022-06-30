const path = `/head-function-export`

const page = {
  basic: `${path}/basic/`,
  pageQuery: `${path}/page-query/`,
  reExport: `${path}/re-exported-function/`,
  staticQuery: `${path}/static-query-component/`,
  warnings: `${path}/warnings/`,
  allProps: `${path}/all-props/`,
  dsg: `${path}/dsg`,
  ssr: `${path}/ssr`,
  invalidElements: `${path}/invalid-elements`,
}

const data = {
  static: {
    base: `http://localhost:9000`,
    title: `Ella Fitzgerald's Page`,
    meta: `Ella Fitzgerald`,
    noscript: `You take romance - I will take Jell-O!`,
    style: `rebeccapurple`,
    link: `/used-by-head-function-export-basic.css`,
  },
  queried: {
    base: `http://localhost:9000`,
    title: `Nat King Cole's Page`,
    meta: `Nat King Cole`,
    noscript: `There is just one thing I cannot figure out. My income tax!`,
    style: `blue`,
    link: `/used-by-head-function-export-query.css`,
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
  },
}

module.exports = { page, data }
