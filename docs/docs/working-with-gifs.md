---
title: Working With GIFs
---

If you're building a blog with Gatsby, chances are you'll want to include some animated GIFs: who wouldn't want to include a dancing otter or cat GIF?

## Including GIFs in components

In Gatsby components and pages, you'll want to import animated GIFs instead of using Gatsby Image because of the way it optimizes image data for the responsive picture element.

Here's an example:

```jsx:title=pages/about.js
import React from 'react'

import Layout from '../components/layout'
import otterGIF from '../gifs/otter.gif'

const AboutPage = () => (
    return (
        <Layout>
            <img src={otterGIF} alt="Otter dancing with a fish" />
        </Layout>
    )
)

export default AboutPage;
```

![otter dancing with a fish](./images/dancing-otter.gif)
