---
title: Security in Gatsby
---

By taking advantage of the benefits of static content, Gatsby inherits several security principles. However, even with this, your users can be exposed to malicious attacks. Read on for further information on potential attack vectors and how you could prevent them.

## Cross-Site Scripting (XSS)

Cross-Site Scripting is a type of attack that injects a script or an unexpected link to another site into the client side of the application.

JSX elements automatically escape HTML tags by design. See the following example:

```js
// highlight-next-line
const username = `<script src='https://path/to/badness.js'></script>`

const User = () => <p> hello {username}</p>
```

When you try to inject the JSX element above it will render `hello <script src='https://path/to/badness.js'></script>` as a string inside the p tag.

On the other hand, fields in your application may need to render inner HTML tags, such as a content field in a blog or a comment in a comments section, that are built into rich-text editors.

In order to render those HTML tags you need to use an HTML parser (e.g. [html-react-parser](https://github.com/remarkablemark/html-react-parser)) or the `dangerouslySetInnerHTML` prop, like so:

```js
const CommentRenderer = comment => (
  // highlight-next-line
  <p dangerouslySetInnerHTML={{ __html: comment }} />
) // dangerous indeed.
```
That's when you expose your application to XSS attacks. 
### **How can you prevent cross-site scripting?**

The most straightforward way to prevent a XSS attack is to sanitize the innerHTML string before dangerously setting it. Fortunately, there are npm packages that can accomplish this; packages like [sanitize-html](https://www.npmjs.com/package/sanitize-html) and [DOMPurify](https://github.com/cure53/DOMPurify).

## Cross-Site Request Forgery (CSRF)

A web application that use cookies could be attacked by the CSRF exploit, which deceives the browser to execute actions by the user's name without notice. By default, the browser "trusts" all the activity made validating the user's identity and therefore sending the associated cookies in every request.

For example, assume that the comments in your blog are sent in a form similar to this one:

```html
<form action="http://mywebsite.com/blog/addcoment" method="POST">
  <input type="text" name="comment" />
  <input type="submit" />
</form>
```

A malicious website could inspect your site and copy it to theirs. If the user are logged in, it still works because when the form is sent, the associated cookies goes with it and the action is made. Even worse, the form could be sent when the page loads with informations you don't control:

```js
// highlight-next-line
<body onload="document.csrf.submit()">
<!-- ... -->
<form action="http://mywebsite.com/blog/addcoment" method="POST" name="csrf" >
  // highlight-next-line
  <input type="hidden" name="comment" value="Hey visit http://maliciouswebsite.com, it's pretty nice" />
  <input type="submit" />
</form>
```

### **How can you prevent cross-site request forgery?**

#### CSRF Tokens

If you want to protect a page your server will provide an encrypted, hard to guess **token**. That token is tied to a user's session and is must be included in every POST request. See the following example:

```js
<form action="http://mywebsite.com/blog/addcoment" method="POST">
  <input type="text" name="comment" />
  // highlight-next-line
  <input type="hidden" name="token" value="SU9J3tMoT1w5q6uJ1VMXaaf9UXzLvyNd" />
  <input type="submit" />
</form>
```

When the form is sent, the server will compare the token received with the stored token and block the action if they are not the same. This works because malicious websites don't have access to the CSRF token due to [HTTP Access Control](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Headers/Access-Control-Allow-Origin).

#### Same-Site Cookies Directive

If you need to create cookies in your application, make sure to protect them by adding the `SameSite` directive:

`Set-Cookie: example=1; SameSite=Strict`

It allows the server to make sure that the cookies are not being sent by a **cross-site** domain request.
Check out [MDN Docs](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Headers/Set-Cookie) for more information on configuring a cookie. You will also want to note current browser support which is available on the [Can I Use page](https://caniuse.com/#feat=same-site-cookie-attribute).

## Third-party Scripts

Some third-party scripts like Google Tag Manager give you the ability to [add arbitrary JavaScript](https://support.google.com/tagmanager/answer/6107167) to your site. This helps integrate third-party tools but can be misused to inject malicious code. To avoid this, be sure to [control access](https://support.google.com/tagmanager/answer/6107011) to these services.

## Check Your Dependencies

In your Gatsby project, you are going to have some dependencies that get stored in `node_modules/`. Therefore, it is important to check if any of them, or their dependencies, have security vulnerabilities.

### Using npm

In npm, you can use the `npm audit` command to check your dependencies. It is available since v6. Check their [docs](https://docs.npmjs.com/cli/audit) for more options.

### Using yarn

Similar to npm, you can use the `yarn audit` command. It is available starting with version `1.12.0` though it is not yet available in version 2. Check the [yarn docs](https://classic.yarnpkg.com/en/docs/cli/audit/) for more options.

## Key Security

Gatsby allows you to [fetch data from various APIs](/docs/content-and-data/) and those APIs often require a key to access them. These keys should be stored in your build environment using [Environment Variables](/docs/environment-variables/). See the following example for fetching data from GitHub with an Authentication Header:

```js
    {
      resolve: "gatsby-source-graphql",
      options: {
        typeName: "GitHub",
        fieldName: "github",
        url: "https://api.github.com/graphql",
        headers: {
          // highlight-next-line
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    }
```

> Note that Gatsby has an [Authentication Tutorial](/tutorial/authentication-tutorial) if you need assistance with setting up authentication on your Gatsby site in a secure way.

## Content Security Policy (CSP)

Content Security Policy is a security layer added in web applications to detect and prevent attacks, e.g. the XSS attack mentioned above.

To add it to your Gatsby website, add [gatsby-plugin-csp](/packages/gatsby-plugin-csp/) to your `gatsby-config.js` with the desired configuration. Note that
currently there is a [incompatibility issue](https://github.com/gatsbyjs/gatsby/issues/10890) between [gatsby-plugin-csp](/packages/gatsby-plugin-csp/) and [gatsby-image](/packages/gatsby-image) and other plugins that generate hashes in inline styles.

> Note that not all browsers support CSP, check [can-i-use](https://caniuse.com/#feat=mdn-http_headers_csp_content-security-policy) for more information.

## Other Resources

- [Security for Modern Web Frameworks](https://www.gatsbyjs.org/blog/2019-04-06-security-for-modern-web-frameworks/)
- [Docs ReactJS: DOM Elements](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [OWASP XSS filter evasion cheatsheet](https://owasp.org/www-community/xss-filter-evasion-cheatsheet)
- [Warn for javascript: URLs in DOM sinks #15047](https://github.com/facebook/react/pull/15047)
- [How to prevent XSS attacks when using dangerouslySetInnerHTML in React](https://medium.com/@Jam3/how-to-prevent-xss-attacks-when-using-dangerouslysetinnerhtml-in-react-f669f778cebb)
- [Exploiting XSS via Markdown](https://medium.com/taptuit/exploiting-xss-via-markdown-72a61e774bf8)
- [Auditing package dependencies for security vulnerabilities](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities)
- [CSRF tokens](https://portswigger.net/web-security/csrf/tokens)
- [SameSite cookies explained](https://web.dev/samesite-cookies-explained/)
