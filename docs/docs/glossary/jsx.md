---
title: JSX
disableTableOfContents: true
---

Learn what _JSX_ is, and how to use JSX to create React components for your Gatsby site.

## What is JSX?

JSX is an XML-like syntax extension for JavaScript that's used to create React components. It's the recommended way to create components, and a more readable alternative to using [`React.createElement()`](https://reactjs.org/docs/react-api.html#createelement). When you create components for your Gatsby site, you're using JSX.

JSX tags resemble HTML and XML tags, and follow similar rules of grammar. As with [XML](https://www.w3.org/TR/REC-xml/), JSX tags must be closed, either by using a closing tag (e.g.: `<p>` and `</p>`) or by self-closing the tag using `/>`. The following example uses JSX to create a form control and label.

```jsx
const input = (
  <div className="form__field">
    <label htmlFor="my_input">My input</label>
    <input type="text" id="my_input" name="field_1" value="" required />
  </div>
)
```

JSX looks like HTML, but it's really an alternate way to write JavaScript that describes a user interface. JSX tags represent JavaScript objects such as HTML and SVG elements.

JSX is JavaScript, so HTML and XML attributes that conflict with reserved words in JavaScript have been renamed. As shown in the preceding example, `htmlFor` replaces the `for` attribute, and the `className` attribute replaces `class`.

JSX also uses [camelCase](https://en.wikipedia.org/wiki/Camel_case) for hyphenated and multi-word attributes and CSS properties. For instance, the `tabindex` attribute becomes `tabIndex`, `background-color` becomes `backgroundColor` and the SVG `stroke-width` attribute becomes `strokeWidth`.

It isn't necessary to enclose multi-line JSX in parentheses, but doing so is a good practice. Parentheses reduce the likelihood of errors caused by [automatic semicolon insertion](https://stackoverflow.com/questions/2846283/what-are-the-rules-for-javascripts-automatic-semicolon-insertion-asi).

You can't use JSX by itself. Browsers do not understand it. JSX tags must be converted to standard JavaScript by a [transpiler](/docs/glossary#transpile). A transpiler is software that converts code from one language or syntax to another. Gatsby and React use [Babel](/docs/glossary#babel) to transpile JSX into browser-compatible JavaScript.

## Learn more about JSX

- [Introducing JSX](https://reactjs.org/docs/introducing-jsx.html) from the React docs.
- [JSX In Depth](https://reactjs.org/docs/jsx-in-depth.html) from the React docs.
- [JSX Specification](https://facebook.github.io/jsx/) (draft)
- [WTF is JSX](https://jasonformat.com/wtf-is-jsx/)
