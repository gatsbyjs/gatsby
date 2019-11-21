---
title: Adding Page Transitions with gatsby-plugin-transition-link
---

This guide will cover how to use `gatsby-plugin-transition-link` to animate transitions between pages on your Gatsby site.

## Overview

The `TransitionLink` component provides a way of describing a page transition via props on a Link component. It works with many animation libraries, like [react-pose](https://popmotion.io/pose/), [gsap](https://greensock.com/), [animejs](https://animejs.com/), and many others.

Note that currently, as the plugin is based on link navigation, transitions when navigating with the browser buttons are not supported.

For other page transition options, see the [overview on adding page animations](/docs/adding-page-transitions).

## Getting started

First, install the plugin:

```shell
npm install --save gatsby-plugin-transition-link
```

Make sure to add the plugin to your `gatsby-config.js`:

```javascript:title=gatsby-config.js
module.exports = {
    plugins: [
      `gatsby-plugin-transition-link`
    ]
];
```

Finally, import the `TransitionLink` component wherever you want to use it:

```javascript
import TransitionLink from "gatsby-plugin-transition-link"
```

## Predefined transitions

You can use the `AniLink` component to add page transitions without having to define your own custom transitions. It's a wrapper around `TransitionLink` that provides 4 predefined transitions: `fade`, `swipe`, `cover`, and `paintDrip`. You can preview them at [this demo site](https://gatsby-plugin-transition-link.netlify.com/).

To use AniLink, you will need to install the `gsap` animation library:

```shell
npm install --save gsap
```

Then, import the AniLink component:

```javascript
import AniLink from "gatsby-plugin-transition-link/AniLink"
```

Finally, make sure you provide your desired animation's name as a blank prop to `AniLink`:

```javascript
<AniLink paintDrip to="page-4">
  Go to Page 4
</AniLink>
```

Options like transition duration, direction, and more are customizable with props. See [the documentation of AniLink](https://transitionlink.tylerbarnes.ca/docs/anilink/) for more details.

## Custom transitions

You have two main methods of creating page transitions:

1. Use the `trigger` function defined in your `exit`/`entry` prop. More details in the '[Using the `trigger` function](#using-the-trigger-function)' subsection.
2. Use the props passed by `TransitionLink` to define your transitions. More details in the '[Using passed props](#using-passed-props)' subsection.

Additionally, you can specify a number of props and options on the `TransitionLink` component, like `length`, `delay`, and more. For more options and details, see [the documentation of TransitionLink](https://transitionlink.tylerbarnes.ca/docs/transitionlink/). For further examples of usage, visit the [plugin's GitHub repository.](https://github.com/TylerBarnes/gatsby-plugin-transition-link)

### Using the trigger function

You can specify a `trigger` function that will handle the animation. This is useful for _imperative_ animation libraries like [animejs](https://animejs.com/) or [GSAP](https://greensock.com/gsap) that specify animations with function calls.

```javascript
<TransitionLink
  exit={{
    length: length,
    // highlight-next-line
    trigger: ({ exit, node }) =>
      this.someCustomDefinedAnimation({ exit, node, direction: "out" }),
  }}
  entry={{
    length: 0,
    // highlight-next-line
    trigger: ({ exit, node }) =>
      this.someCustomDefinedAnimation({ exit, node, direction: "in" }),
  }}
  {...props}
>
  {props.children}
</TransitionLink>
```

### Using passed props

The exiting and entering pages/templates involved in the transition will receive props indicating the current transition status, as well as the `exit` or `enter` props defined on the `TransitionLink`.

```javascript
const PageOrTemplate = ({ children, transitionStatus, entry, exit }) => {
  console.log(transitionStatus, entry, exit)
  return <div className={transitionStatus}>{children}</div>
}
```

You can combine these props with a _declarative_ state-based animation libraries like [react-pose](https://popmotion.io/pose/) or [react-spring](http://react-spring.surge.sh/) to specify transitions for exiting and entering a page.

If you want to access these props in one of your components instead of a page/template, you should wrap your component in the `TransitionState` component. This component takes a function that will have access to the same props as above, which you can then use in your component.

Here's an example using `TransitionState` and `react-pose` to trigger enter/exit transitions for a `Box` component.

```javascript
import { TransitionState } from "gatsby-plugin-transition-link"

const Box = posed.div({
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
})

<TransitionState>
      {({ transitionStatus, exit, enter }) => {
        console.log('exit object is', exit)
        console.log('enter object is', enter)

        return (
            <Box
              className="box"
              pose={
                ['entering', 'entered'].includes(transitionStatus)
                  ? 'visible'
                  : 'hidden'
              }
            />
        )
      }}
</TransitionState>
```

Now, the `Box` component will be aware of the transition status of the page it's a child of, and it will fade in/out accordingly.

## Excluding elements from page transitions

You may want to have elements on a page that persist throughout the page transition (_ex. a site-wide header_). This can be accomplished by wrapping elements in the `TransitionPortal` component.

```javascript
import { TransitionPortal } from "gatsby-plugin-transition-link"
```

```javascript
<TransitionPortal>
  <SomeComponent>
    This component will sit on top of both pages, and persist through page
    transitions.
  </SomeComponent>
</TransitionPortal>
```

As always, check out [the `TransitionPortal` docs](https://transitionlink.tylerbarnes.ca/docs/transitionportal/) for more information about `TransitionPortal`.

## Further reading

- [Official documentation](https://transitionlink.tylerbarnes.ca/docs/)
- [Source code for plugin](https://github.com/TylerBarnes/gatsby-plugin-transition-link)
- [Demo site](https://gatsby-plugin-transition-link.netlify.com/)
- [Blog post: 'Per-Link Gatsby page transitions with TransitionLink'](/blog/2018-12-04-per-link-gatsby-page-transitions-with-transitionlink/)
- [Using transition-link with react-spring](https://github.com/TylerBarnes/gatsby-plugin-transition-link/issues/34)
