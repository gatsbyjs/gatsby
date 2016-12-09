# How Gatsby Works

## How files become pages
The process is file --> Webpack loader --> React.js wrapper component
--> static HTML page.

Gatsby leverages [Webpack](http://webpack.github.io/) extensively.
 Webpack is a sophisticated module bundler that can turn any sort of
file into a commonjs module. Webpack uses "Loaders" to convert a file
into a module. These loaded modules are then wrapped inside a React.js
component that's specific to a given file type. Gatsby then generates a
static HTML page from this component.

Gatsby ships with default loaders and wrappers for HTML, Markdown, and
JSX/CJSX but for most projects you'll want to write your own loaders and
wrappers (very easy to do).

As an example of how this process works, let's walk quickly through
converting a markdown file into an HTML page.

The [default Gatsby markdown
loader](https://github.com/gatsbyjs/gatsby/blob/master/lib/loaders/markdown-loader/index.js)
 parses the markdown into HTML and uses [Highlight.js](https://highlightjs.org/)
 to syntax highlight code blocks.

Our markdown file at `your-project/pages/index.md`:

```
---
title: This is a title
someObject:
  someKey: This is an awesome page
someArray: [ 1, 2 ]
---

## Hi friends.
This is a markdown file.
```
Everything *between* the triple-dashes is frontmatter. It must be in YAML format. Everything *after* the frontmatter is markdown, and will be parsed into HTML. Note that you can also include raw HTML here, and it will be passed through unmodified.

When automatically loaded and required, the resulting javascript object looks like the following:

```javascript
{
  file: {
    // Information about file on disk e.g. extension, directory path, etc.
  },
  data: {
    title: "This is a title",
    someObject: {
      someKey: "This is an awesome page",
    },
    someArray: [ 1, 2 ],
    body: "<h2>Hi friends.</h2><p>This is a markdown file.</p>"
  }
}
```
Now Gatsby wraps the markdown file in this very simple React.js component. By default, it looks something like this, and you can edit it to handle any custom frontmatter as you see fit:

```javascript
// your-project/wrappers/md.js
export default class MarkdownWrapper extends Component {
  render: function() {
    const post = this.props.route.page.data
    return (
      <div className="markdown">
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{__html: post.body}} />
      </div>
    )
  }
}
```

Next is the template for your pages (*edited for brevity*):


```javascript
// your-project/pages/_template.js
export default class PageTemplate extends Component {
  render() {
    // children will be the result of MarkdownWrapper.render()
    const { children } = this.props
    
    return (
      <div className="page-template">
        {children}
      </div>
    )
  }
}
```

Finally, it gets passed through the outer-most template (*edited for brevity*):

```javascript
// your-project/html.js
export default class HTML extends Component {
  render() {
    // body will be the result of PageTemplate.render()
    const { body } = this.props
    return (
      <html lang="en">
        <body>
          <div id="react-mount"
               dangerouslySetInnerHTML={{ __html: body }} 
          />
        </body>
      </html>
    )
  }
}
```

Rendering a final result of:

```html
<html lang="en">
<body>
  <div id="react-mount">
    <div class="page-template">
      <div class="markdown">
        <h1>This is a title</h1>
        <h2>Hi friends.</h2>
        <p>This is a markdown file.</p>
      </div>
    </div>
  </div>
</body>
</html>
```

## Notable props-of-interest available in templates

### All pages 
`this.props.route.pages`

### The current template's children 
`this.props.route.childRoutes`

### The current page 
`this.props.routes[this.props.routes.length - 1].page`
