# gatsby-plugin-redirects

> Client-side redirects for gatsby

Because Gatsby intends for navigation to be handled by the client, it follows that redirects should as well. This plugin can be used to generate client-side redirects by dynamically creating pages for them.

## Install

`npm install --save gatsby-plugin-redirects`

## How to use

```javascript
// In your gatsby-config.js
plugins: [{
    resolve: 'gatsby-plugin-redirects',
    options: {
        redirects: [{
            from: '/a',
            to: '/b'
        }]
    }
}]
```

### Custom Redirect component

If a user's first visit to your site is through a redirect page, there may be a small amount of latency during which the user will simply see your page's layout (via `src/layouts/index.js`) with no content. In cases where this is undesired, you can specify a custom component to render at this time.

First, write your component. Note that it must contain a `GatsbyRedirect` child with inherited props.

```jsx
import React from 'react'
import { GatsbyRedirect } from 'gatsby-plugin-redirects'

const RedirectWrapper = (props) => (
    <div>
        <p>Some custom content</p>
        <GatsbyRedirect {...props}/>
    </div>
);
export default RedirectWrapper;
```

Then, configure via `gatsby-config.js` by specifying the path to your component. You may do so with respect to all redirects or at a per-redirect level, with the latter taking precedence.

```javascript
// In your gatsby-config.js
plugins: [{
    resolve: 'gatsby-plugin-redirects',
    options: {
        component: path.resolve('path/to/RedirectWrapper'),
        redirects: [{
            from: '/c',
            to: '/d'
        }, {
            from: '/e',
            to: '/f',
            component: path.resolve('path/to/CustomRedirectWrapper')
        }]
    }
}]
```

