---
title: Security in Gatsby
---

By being a modern static site generator, Gatsby inherits several security principles that comes with this approach. However, even with this, your users could be exposed to malicious attacks. In this page, you will see what they are and how you could prevent them.

## Cross-Site Scripting (XSS)

Cross-Site Scripting is a type of attack that injects a script or a unexpected link to another site into the client side of the application.

JSX elements automatically escape HTML tags by design. So, when you try to inject them as the example below:

```js
// highlight-next-line
const username = `<script src='https://path/to/badness.js'></script>`

const User = () => <p> hello {username}</p>
```

it will render `hello <script src='https://path/to/badness.js'></script>` as a string inside the p tag.

In other hand, there could be some fields in your application that you will need to render the inner HTML tags, such as a content field in a blog or a comment in a comments section, that are built in rich-text editors.

That's when you expose your application to XSS attacks, since the way to render these HTML tags is by using a HTML parser (e.g. [html-react-parser](https://github.com/remarkablemark/html-react-parser)) or using the `dangerouslySetInnerHTML` prop, as this example below:

```js
const CommentRenderer = comment => (
  // highlight-next-line
  <p dangerouslySetInnerHTML={{ __html: comment }} />
) // dangerous indeed.
```

**How can it be prevented?**

The most straightforward way to prevent the XSS attack is to sanitize the innerHTML string before dangerously setting it. Fortunately, there are npm packages that does the job, like [sanitize-html](https://www.npmjs.com/package/sanitize-html) and [DOMPurify](https://github.com/cure53/DOMPurify).

## Cross-Site Request Forgery (CSRF)

A web application that use cookies could be attacked by the CSRF exploit, which deceives the browser to execute actions by the user's name without notice. By default, the browser "trusts" all the activity made validating the user's identity and therefore sending the associated cookies in every request.

For example, assume that the comments done in your blog are sent in a form like this below:

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

**How can it be prevented?**

### CSRF Tokens

In a page you want to protect, your server will provide an encrypted, hard to guess **token**, which is tied to the user's session and thus will be required to be sent back in the POST form:

```js
<form action="http://mywebsite.com/blog/addcoment" method="POST">
  <input type="text" name="comment" />
  // highlight-next-line
  <input type="hidden" name="token" value="SU9J3tMoT1w5q6uJ1VMXaaf9UXzLvyNd" />
  <input type="submit" />
</form>
```

So when the form is sent, the server will compare them and block the action if they are not the same. Note that usually the malicious website won't have access to this CSRF token because of [HTTP Access Control](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Headers/Access-Control-Allow-Origin).

### Same-Site Cookies Directive

If you need to create cookies in your application, make sure to protect them by adding the `SameSite` directive:

`Set-Cookie: example=1; SameSite=Strict`

It allows the server to make sure that the cookies are not being sent by a **cross-site** domain request.
Check out [MDN Docs](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Headers/Set-Cookie) regarding how a cookie could be configured. You can checkout current browser support over on the [Can I Use page](https://caniuse.com/#feat=same-site-cookie-attribute).

## Third-party Scripts

Some third-party scripts like Google Tag Manager gives the possibility to add arbitrary JavaScript code on top of them as a [custom HTML tag](https://support.google.com/tagmanager/answer/6107167), which can be a malicious script. To avoid that, be sure to have a [access control](https://support.google.com/tagmanager/answer/6107011) management in these services.

## Check Your Dependencies

In your Gatsby project, you are going to have a lot of dependencies (which has their own dependencies as well) in your `node_modules/`. Therefore, it is important to check if any of them has a security issue.

**Using `npm`**

In npm, you can use the `npm audit` command to check your dependencies. It is available since v6. Check their [docs](https://docs.npmjs.com/cli/audit) for more options.

**Using `yarn`**

Similar to `npm`, you can use the `yarn audit` command. It is available since v1.12.0, not available in v2. Check their [docs](https://classic.yarnpkg.com/en/docs/cli/audit/) for more options.

## Key Security

Gatsby provides the capability of [fetching data from various APIs](/docs/content-and-data/) and those APIs often require a key to access them. These keys should be stored in the build environment using [Environment Variables](/docs/environment-variables/) as shown below when fetching data from GitHub with an Authentication Header:

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

Note: Whether you need to authenticate someone in your application, Gatsby has an [Authentication Tutorial](/tutorial/authentication-tutorial) which helps doing this job in a secure way.

## Content Security Policy (CSP)

Content Security Policy is a security layer added in web applications to detect and prevent attacks, e.g. the XSS attack mentioned above.

To add it to your Gatsby website, add [gatsby-plugin-csp](/packages/gatsby-plugin-csp/) to your `gatsby-config.js` with the desired configuration. Note that
currently there is a [incompatibility issue](https://github.com/gatsbyjs/gatsby/issues/10890) between [gatsby-plugin-csp](/packages/gatsby-plugin-csp/) and [gatsby-image](/packages/gatsby-image) and other plugins that generate hashes in inline styles.

Note: Not all browsers support CSP, check [can-i-use](https://caniuse.com/#feat=mdn-http_headers_csp_content-security-policy) for more information.

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
