import React from "react"
import PropTypes from "prop-types"
import { graphql, Link, navigate } from "gatsby"
import queryString from "query-string"

function Dev404Page({location, custom404, data, search}) {
  const [hasMounted, setHasMounted] = React.useState(false);
  const [showCustom404, setShowCustom404] = React.useState(process.env.GATSBY_DISABLE_CUSTOM_404 || false);
  const [initPagePaths, setInitPagePaths] = React.useState(pagePaths);
  const [pagePathSearchTerms, setPagePathSearchTerms] = React.useState(initialPagePathSearchTerms);
  const [pagePaths, setPagePaths] = React.useState(this.getFilteredPagePaths(
        pagePaths,
        initialPagePathSearchTerms
      ));
  React.useEffect(() => {
    setHasMounted(true)
  }, []);

  static propTypes = {
    data: PropTypes.object,
    custom404: PropTypes.element,
    location: PropTypes.object,
  }

  function showCustom404() {
    this.setState({ showCustom404: true })
  }

  function handleSearchTermChange(event) {
    const searchValue = event.target.value

    setSearchUrl(searchValue)

    this.setState({
      pagePathSearchTerms: searchValue,
    })
  }

  function handlePagePathSearch(event) {
    event.preventDefault()
    const allPagePaths = [...initPagePaths]
    this.setState({
      pagePaths: getFilteredPagePaths(
        allPagePaths,
        pagePathSearchTerms
      ),
    })
  }

  function getFilteredPagePaths(allPagePaths, pagePathSearchTerms) {
    const searchTerm = new RegExp(`${pagePathSearchTerms}`)
    return allPagePaths.filter(pagePath => searchTerm.test(pagePath))
  }

  function setSearchUrl(searchValue) {
    const {
      location: { pathname, search },
    } = this.props

    const searchMap = queryString.parse(search)
    searchMap.filter = searchValue

    const newSearch = queryString.stringify(searchMap)

    if (search !== `?${newSearch}`) {
      navigate(`${pathname}?${newSearch}`, { replace: true })
    }
  }

  if (!hasMounted) {
return null
}

const { pathname } = location
let newFilePath
let newAPIPath
if (pathname === `/`) {
newFilePath = `src/pages/index.js`
} else if (pathname.slice(0, 4) === `/api`) {
newAPIPath = `src${pathname}.js`
} else if (pathname.slice(-1) === `/`) {
newFilePath = `src/pages${pathname.slice(0, -1)}.js`
} else {
newFilePath = `src/pages${pathname}.js`
}

return showCustom404 ? (
custom404
) : (
<div>
<h1>Gatsby.js development 404 page</h1>
<p>
There's not a page or function yet at{` `}
<code>{pathname}</code>
</p>
{custom404 ? (
<p>
<button onClick={showCustom404}>
Preview custom 404 page
</button>
</p>
) : (
<p>
{`A custom 404 page wasn't detected - if you would like to add one, create a component in your site directory at `}
<code>src/pages/404.js</code>.
</p>
)}
{newFilePath && (
<div>
<h2>Create a page at this url</h2>
<p>
Create a React.js component like the following in your site
directory at
{` `}"<code>{newFilePath}</code>"{` `}
and then refresh to show the new page component you created.
</p>
<pre
style={{
border: `1px solid lightgray`,
padding: `8px`,
maxWidth: `80ch`,
background: `#f3f3f3`,
}}
>
<code
dangerouslySetInnerHTML={{
__html: `import * as React from "react"

export default function Component () {
  return "Hello world"
}`,
}}
/>
</pre>
</div>
)}
{newAPIPath && (
<div>
<h2>Create an API function at this url</h2>
<p>
Create a javascript file like the following in your site directory
at
{` `}"<code>{newAPIPath}</code>"{` `}
and refresh to execute the new API function you created.
</p>
<pre
style={{
border: `1px solid lightgray`,
padding: `8px`,
maxWidth: `80ch`,
background: `#f3f3f3`,
}}
>
<code
dangerouslySetInnerHTML={{
__html: `
export default function API (req, res) {
  res.json({ hello: "world" })
}`,
}}
/>
</pre>
</div>
)}
{initPagePaths.length > 0 && (
<div>
<hr />
<p>
If you were trying to reach another page or function, perhaps you
can find it below.
</p>
<h2>Functions ({data.allSiteFunction.nodes.length})</h2>
<ul>
{data.allSiteFunction.nodes.map(node => {
const functionRoute = `/api/${node.functionRoute}`
return (
<li key={functionRoute}>
<a href={functionRoute}>{functionRoute}</a>
</li>
)
})}
</ul>
<h2>
Pages (
{pagePaths.length != initPagePaths.length
? `${pagePaths.length}/${initPagePaths.length}`
: initPagePaths.length}
)
</h2>

<form onSubmit={handlePagePathSearch}>
<label>
Search:
<input
type="text"
id="search"
placeholder="Search pages..."
value={pagePathSearchTerms}
onChange={handleSearchTermChange}
/>
</label>
<input type="submit" value="Submit" />
</form>
<ul>
{pagePaths.map(
(pagePath, index) =>
index < 100 && (
<li key={pagePath}>
<Link to={pagePath}>{pagePath}</Link>
</li>
)
)}
{pagePaths.length > 100 && (
<p style={{ fontWeight: `bold` }}>
... and {pagePaths.length - 100} more.
</p>
)}
</ul>
</div>
)}
</div>
);
}

export default Dev404Page

// ESLint is complaining about the backslash in regex
/* eslint-disable */
export const pagesQuery = graphql`
  query PagesQuery {
    allSiteFunction {
      nodes {
        functionRoute
      }
    }
    allSitePage(filter: { path: { regex: "/^(?!\/dev-404-page).+$/" } }) {
      nodes {
        path
      }
    }
  }
`
/* eslint-enable */
