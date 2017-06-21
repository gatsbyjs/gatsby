---
title: "Code Highlighting"
date: "2017-04-04"
draft: false
author: Daisy Buchanan
tags:
  - remark
  - Code Highlighting
---
![](jeremy-bishop-262119.jpg)
*Photo by [Jeremy Bishop](https://unsplash.com/@tidesinourveins) via [Unsplash](https://unsplash.com/?photo=XxpCNQ_w3is)*

Let's see how `gatsby-remark-prismjs` and its example CSS look like:

```javascript{1-2,22}
// In your gatsby-config.js
// Let's make this line very long so that our container has to scroll its overflow…
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: `gatsby-remark-responsive-image`,
          options: {
            maxWidth: 756,
          },
        },
        {
          resolve: `gatsby-remark-responsive-iframe`,
          options: {
            wrapperStyle: `margin-bottom: 1.0725rem`,
          },
        },
        `gatsby-remark-copy-linked-files`,
        `gatsby-remark-smartypants`,
        `gatsby-remark-prismjs`,
      ]
    }
  }
]
```

Let's do something crazy and add a list with another code example:

* **A list item**

  …and a paragraph! In my younger and more vulnerable years my father gave me some advice that I’ve been turning over in my mind ever since.

  1. A nested numbered list
  2. “Whenever you feel like criticizing any one,” he told me, “just remember that all the people in this world haven’t had the advantages that you’ve had.”

* Roger that, now back to topic: _Highlighted code blocks work here, too:_
    ```css{10,13}
    .clearfix:after {
    	visibility: hidden;
    	display: block;
    	font-size: 0;
    	content: " ";
    	clear: both;
    	height: 0;
    	}
    .clearfix { display: inline-table; }
    /* Hides from IE-mac \*/
    * html .clearfix { height: 1%; }
    .clearfix { display: block; }
    /* End hide from IE-mac */
    ```

  Wow, "IE-mac"? [Yeah, that was a thing](https://en.wikipedia.org/wiki/Internet_Explorer_for_Mac) back in the day … a good one at the time, too:

  > Initial versions were developed from the same code base as Internet Explorer for Windows. Later versions diverged, particularly with the release of version 5 which included the cutting edge, [fault-tolerant](https://en.wikipedia.org/wiki/Fault-tolerant) and highly standards-compliant [Tasman](https://en.wikipedia.org/wiki/Tasman_(layout_engine)) [layout engine](https://en.wikipedia.org/wiki/Layout_engine).

  Source: https://en.wikipedia.org/wiki/Internet_Explorer_for_Mac
* ** The last list item** –- no more list items after this one, pinky swear!
