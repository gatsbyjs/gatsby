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

Cross-Site request forgery is a type of exploit that which deceives the browser to execute unauthorized actions. By default, in any request made, the browser automatically appends any stored cookies of the destination domain. Combining this with a crafted request, an malicious website can read and write data without the user's action or knowledge.

For example, assume that the comments in your blog are sent in a form similar to this one:

```html
<form action="http://mywebsite.com/blog/addcomment" method="POST">
  <input type="text" name="comment" />
  <input type="submit" />
</form>
```

A malicious website could inspect your site and copy this snippet to theirs. If the user are logged in, the associated cookies is sent with the form and the server can not distinguish the origin of it. Even worse, the form could be sent when the page loads with informations you don't control:

```js
// highlight-next-line
<body onload="document.csrf.submit()">
<!-- ... -->
<form action="http://mywebsite.com/blog/addcomment" method="POST" name="csrf">
  // highlight-next-line
  <input type="hidden" name="comment" value="Hey visit http://maliciouswebsite.com, it's pretty nice" />
  <input type="submit" />
</form>
```

### **How can you prevent cross-site request forgery?**

#### Don't use GET requests to modify data

Actions that do not simply read data should be handled in a POST request. In the example above, if the `/blog/addcomment` accepts a GET request, the CSRF attack can be done using a `<img />` tag:

```html
<img src="http://mywebsite.com/blog/addcomment?comment=unwanted%20comment" />
```

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

When the form is sent, the server will compare the token received with the stored token and block the action if they are not the same. Make sure that malicious websites don't have access to the CSRF token by using [HTTP Access Control](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Headers/Access-Control-Allow-Origin).

#### Same-Site Cookies Attribute

This cookie attribute is targeted to prevent CSRF attacks. If you need to create a cookie in your application, make sure to protect them by this attribute, that could be of `Strict` or `Lax` type:

`Set-Cookie: example=1; SameSite=Strict`

It allows the server to make sure that the cookies are not being sent by a **cross-site** domain request.
Check out [MDN Docs](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Headers/Set-Cookie) for more information on configuring a cookie. You will also want to note current browser support which is available on the [Can I Use page](https://caniuse.com/#feat=same-site-cookie-attribute).

Quoting [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#samesite-cookie-attribute):

> It is important to note that this attribute should be implemented as an additional layer defense in depth concept. This attribute protects the user through the browsers supporting it, and it contains as well 2 ways to bypass it as mentioned in the following section. This attribute should not replace having a CSRF Token. Instead, it should co-exist with that token in order to protect the user in a more robust way. Also remember that any Cross-Site Scripting (XSS) can be used to defeat all CSRF mitigation techniques!

## Third-party Scripts

Some third-party scripts like Google Tag Manager give you the ability to [add arbitrary JavaScript](https://support.google.com/tagmanager/answer/6107167) to your site. This helps integrate third-party tools but can be misused to inject malicious code. To avoid this, be sure to [control access](https://support.google.com/tagmanager/answer/6107011) to these services.

## Check Your Dependencies

In your Gatsby project, you are going to have some dependencies that get stored in `node_modules/`. Therefore, it is important to check if any of them, or their dependencies, have security vulnerabilities.

### Using npm

In npm, you can use the `npm audit` command to check your dependencies. This command is available in all npm versions greater than `6.0.0`. Check [npm docs](https://docs.npmjs.com/cli/audit) for more options.

### Using yarn

Similar to npm, you can use the `yarn audit` command. It is available starting with version `1.12.0` though it is not yet available in version 2. Check the [yarn docs](https://classic.yarnpkg.com/en/docs/cli/audit/) for more options.

## Key Security

Gatsby allows you to [fetch data from various APIs](/docs/content-and-data/) and those APIs often require a key to access them. These keys should be stored in your build environment using [Environment Variables](/docs/environment-variables/). See the following example for fetching data from GitHub with an Authorization Header:

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

### Storing keys in client-side

Sometimes in your Gatsby website, you will need display sensitive data or handle authenticated routes (e.g. a page that shows a user's orders in your ecommerce). Gatsby has an [Authentication Tutorial](/tutorial/authentication-tutorial) if you need assistance with setting up authentication flow. Use cookies to store the credentials in client-side, preferably with `SameSite` attribute listed above. Check out [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies) to further explanation about these attributes and how to configure them.

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
