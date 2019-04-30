---
title: Global CSS files
---

### Styling React components

Global CSS files are the traditional approach to styling websites.

CSS rules are declared in separate `.css` files, and referenced in HTML with classes.

```css
.primary {
  background: orangered;
  color: white;
}
```

```html
<button class="primary">Click me</button>
```

There is only one difference in JSX: since `class` is a reserved word in JavaScript, you'll have to use the `className` prop instead.

```jsx
<button className="primary">Click me</button>
```
