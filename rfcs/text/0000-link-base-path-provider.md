- Start Date: 2020-03-15
- RFC PR: (leave this empty)
- Gatsby Issue: (leave this empty)

# Summary

Currently Gatsby can accept a basePath/pathPrefix that is static. This is very useful when hosting off anything that isn't the root of the domain. The `<Link />` component will look at this and behave appropriately by adding this to the path specified. The static nature of this value makes it problematic to use when adding additional pathPrefixes that cannot be determined statically.

> **NOTE** from this point forward an Internationalization library will be used as a point of reference throughout this RFC, despite the RFC not being limited to just that

[Internationalization](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-i18n) is a good example of this, where the basePath is the locale the user of the Gatsby site is visiting, i.e:

- /en-US/
- /en-US/docs/
- /en-US/showcase/

This is a recommended SEO approach to dealing with localized pages and works well with Gatsby, but requires a revised HOC that can prefix the locale with the path before rendering the default `<Link />`.

Implementing a "Base Path" react context would allow 3rd party internationalization libraries to instruct Gatsby's `<Link />` component to use a different basePath without the library consumer having to use HOCs

# Basic example

"Out the box" implementation:

```js
<BasePathContext.Provider
  value={typeof __BASE_PATH__ !== `undefined` ? __BASE_PATH__ : __PATH_PREFIX__}
>
  ...
  <MyPage>
    ...
    <Link to="/docs">Docs</Link>
  </MyPage>
</BasePathContext.Provider>
```

"i18n library":

```js
const basePath = useContext(BasePathContext) //Get the basepath from the existing BasePathContext
const path = basePath + currentLocale // add base path with currentlocale => /en-US/

<BasePathContext.Provider
  value={path}
>
  ...
  <MyPage>
    ...
    <Link to="/docs">Docs</Link>
  </MyPage>
</BasePathContext.Provider>
```

# Motivation

Currently to support Internationalization HOCs must be used to affect the path of the `<Link />`. That means the library consumer must rework all `<Link />` to `<LocalizedLink />` or something equivalent. This is:

- A codemod or migration to change all existing code using `<Link />`
- Ongoing cost to make sure that `<Link />` components are not used, which might be as a result of
  _ Copy/pasted code
  _ Other libraries that are not aware of the localization HOC (3rd party or component libraries) \* Auto import from code editors selecting the wrong `<Link />`

By moving to a react context based approach, an internationalization library can simply use `wrapPageElement` or similar to implement a more contextually-aware `BasePathContext`. The Gatsby `<Link />` component will then use the localized `BasePathContext` provider instead of the default one (React takes care of this automatically).

# Detailed design

1. Create a `BasePathContext` (react context) that is exported
2. Apply a default context provider somewhere in the `<Root />` component tree. This default provider will take the current basePath logic `typeof __BASE_PATH__ !== "undefined" ? __BASE_PATH__ : __PATH_PREFIX__` out of the `<Link />` component
3. Wrap the `<Link />` component in a `BasePathContext.Consumer` that will pass the basePath into the `<Link />` component
4. Consume the basePath prop in the `withPrefix` function

# Drawbacks

There could be a performance impact. The `BasePathContext` won't cause any re-renders as the value will not change, but there's always _some_ cost of consuming a react context even if it's **negligible**. There doesn't seem to be any warning from React about using the context, only a disclaimer if the provider is [passing down objects](https://reactjs.org/docs/context.html#caveats)

Documentation will be helpful to create to detail how someone could "override" the context, the i18n example in the gatsby repro could be updated and used as a reference, which helps demonstrate the implementation.

# Adoption strategy

Adoption is simply opt-in, library authors can migrate to this at their own discretion.

# How we teach this

Documentation could exist in a few places, but suitable areas include "Gatsby API => Gatsby Link", "Localization pages", "path prefix", etc.
