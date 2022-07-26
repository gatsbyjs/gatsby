---
title: Working with GIFs
---

If you're building a blog with Gatsby, chances are you'll want to include some animated GIFs: who wouldn't want to include a dancing otter or cat GIF?

## Including GIFs in components

In Gatsby components and pages, you'll want to import animated GIFs instead of using Gatsby Image because of the way it optimizes image data for the responsive picture element.

Here's an example:

```jsx:title=pages/about.js
import * as React from 'react'

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

## Including GIFs in Markdown

In Markdown posts and pages, including an animated GIF is the same as a static image:

```markdown
![otter dancing with a fish](../../images/dancing-otter.gif)
```

![otter dancing with a fish](../../images/dancing-otter.gif)

Animated GIFs can be quite large in size, so be careful not to sabotage your webpages' performance with extremely large files. You could reduce file size by [optimizing the frames](https://skylilies.livejournal.com/244378.html) or converting them to video.

## Accessibility concerns with animated GIFs

Beware that flashing and autoplaying GIFs can cause issues for users who are sensitive to motion. GIFs should not autoplay whenever possible for safety reasons. One technique would be to add controls, such as using a package like [react-gif-player](https://www.npmjs.com/package/react-gif-player) as a [client-only package](/docs/using-client-side-only-packages/).

For more information on accessible motion:

- https://source.opennews.org/articles/motion-sick/
- https://www.w3.org/TR/UNDERSTANDING-WCAG20/time-limits-pause.html
