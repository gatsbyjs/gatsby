---
title: Per-Link Gatsby page transitions with TransitionLink
date: 2018-12-27
author: Tyler Barnes
tags:
  - plugins
  - cutting-edge-experiences
---

When I started developing in React and Gatsby, one of the most exciting things to me was that it would be easier to code up page transitions than it had been before.

There was one problem though. Once I finally got around to adding transitions to a Gatsby site I was working on, I quickly realized that there was no simple way to do page transitions and the types of transitions I was interested in were basically impossible. To me this was a nonstarter so after a few weeks of experimentation I came up with [`gatsby-plugin-transition-link`](https://transitionlink.tylerbarnes.ca).

TransitionLink is a simple way of declaring a page transition via props on a Link component. For both entering and exiting pages you can specify a number of timing values, pass state, and add a trigger a function.

TransitionLink is compatible with declarative react animation libraries like [react-pose](https://popmotion.io/pose/) and [react-spring](https://react-spring.surge.sh/). It's also compatible with imperative animation libraries like [gsap](https://greensock.com) and [anime.js](http://animejs.com/)

Check it out [in use](https://gatsby-plugin-transition-link.netlify.com/).

## The story

I've always wanted to create one of those beautiful [awwwards](https://www.awwwards.com/) sites you're probably familiar with. Because it quickly becomes complex to manage what a transition should look like to and from specific sets of pages, I've often settled on using a simple fade transition between all pages. It's complicated and time consuming to set up page transitions and that's always been a major disappointment for me.

I wanted a flexible way to specify when and where a page transition should happen, and only when coming from or going to other specific pages, and I wanted it to be easy to manage that. I wanted the freedom to build anything I could dream up without spending a few hundred hours in the process!

After hashing it out on a few Gatsby sites I could only find unsatisfactory solutions. First I thought of setting up an object that I could check the current pathname against to derive my transitions from. I almost started building it but the thought of how overwhelming and downright ugly this would be in production stopped me. No thanks! Next, I played with setting transition data on Gatsby templates and pages and then triggering the current page transition based on that data from inside a persistent layout component.

Though this worked, pages could only have a single exit and entry transition no matter where the user was coming from or going to. This too was not the solution.

After having spent a couple weeks of evenings after work hammering away at this problem, my obsession was still going strong. Laying in bed one night after coding for too long it suddenly hit me: I've been looking for a Link between two pages which determines what their shared transition should look like. ...a LINK! I had been looking for the simple page link that I'd been staring at and clicking the whole time. In retrospect it's almost too obvious. Links are already the mediator between pages. They control the default browser page transition (an abrupt jump), of course they should specify which page transition will carry the user from one place to the next.

### Get started right away

Because I know you might not be as obsessed with creating beautiful page transitions as myself, I created another component called AniLink which wraps around TransitionLink to provide some default transitions. This component offers four transitions; paintDrip, swipe, cover, and fade. Getting started is only a few steps: install TransitionLink, import AniLink to your pages, and set a prop or two to customize.

```jsx
<AniLink fade to="page-2">
  Go to Page 2
</AniLink>
```

```jsx
<AniLink paintDrip duration={1} to="page-3">
  Go to Page 3
</AniLink>
```

```jsx
<AniLink cover direction="up" bg="rebeccapurple" to="page-3">
  Go to Page 3
</AniLink>
```

[Read more about AniLink at the docs](https://transitionlink.tylerbarnes.ca/docs/anilink/)

### Build your own transitions

To be honest, I'm hoping you don't use AniLink. While AniLink could be better than nothing, you can create something much better because it will be unique and tailored to your project. Here's a quick example using TransitionLink and react-pose to fade between pages.

```jsx
// Your link
<TransitionLink to="page-2" exit={{ length: 0.5 }}>
  Go to page 2
</TransitionLink>
```

```jsx
// Your pose
export const Fade = posed.div({
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
})

...

// In a component that wraps your page contents
export const FadeWrapper = ({ children }) => {
  // We're using the TransitionState component here to provide the current transition status to our pose
  <TransitionState>
    {({ transitionStatus }) => (
      <Fade
          pose={
             ['entering', 'entered'].includes(transitionStatus)
             ? 'visible'
             : 'hidden'
          }>
          {children}
      </Fade>
    )}
  </TransitionState>
}
```

You can then wrap your TransitionLink into a reusable component and use it throughout your project.

```jsx
const FadeLink = ({ to, children }) => (
  <TransitionLink to={to} exit={{ length: 0.5 }}>
    {children}
  </TransitionLink>
)
```

```jsx
<FadeLink to="/page-2">Go to page 2</FadeLink>
```

The beauty of this is that if you decide a certain page requires something more complex than a fade, you can add more transitions as needed.

Here's an example of a more complicated TransitionLink using [gsap](https://greensock.com) to create a coloured ripple that moves outwards from the users mouse click, eventually covering the whole page.

```jsx
<TransitionLink
  exit={{
    length: 0.6,
    trigger: ({ exit, e, node }) =>
      this.createRipple(exit, e, props.color, node),
  }}
  entry={{
    delay: 0.3,
    length: 0.6,
    trigger: ({ entry, node }) => this.slideIn(entry, node, "left"),
  }}
>
  {props.children}
</TransitionLink>
```

The animation code for `this.createRipple` would be a bit much to copy here but you can check it out on the [TransitionLink GitHub](https://github.com/TylerBarnes/gatsby-plugin-transition-link/blob/master/src/AniLink/PaintDrip.js). If you'd like you can also try it out with AniLink's paintDrip transition (check the [AniLink docs](https://transitionlink.tylerbarnes.ca/docs/anilink/) for usage).

As you can see, TransitionLink offers quite a wide variety of control for page transitions! You're able to set the length, delay, state, and a trigger function for both entering and exiting pages, allowing you to use both declarative and imperative animations and as many transitions as you need.

### Optional components to help you out

In addition to TransitionLink and AniLink, there's also the TransitionState and TransitionPortal components. While I was developing and testing TransitionLink it became obvious that these two components were needed to keep things manageable and get around some limitations.

TransitionState uses children as a function to pass the transition status of the page the component is used on. That means you can use it throughout your pages to make your components aware of the transition status of the page it's a child of. You can also use this component to pass any kind of state from TransitionLink to your components.

TransitionPortal is a React portal which allows you to position animation elements above both your exiting and entering pages. Sometimes you'll need to have something persist throughout the whole animation and some other page element will overlap it. Portals are great for solving that.

[Check the docs](https://transitionlink.tylerbarnes.ca/docs) for more info on TransitionState and TransitionPortal.

### Capping it off

I'm excited to see what you and the rest of the Gatsby community will build with TransitionLink! Feel free to send any unanswered questions or issues you may have [my way](https://github.com/TylerBarnes/gatsby-plugin-transition-link/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc). I'll do my best to help you out asap.
