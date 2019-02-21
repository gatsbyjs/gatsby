import CMS from "netlify-cms"

// The following window and global config settings below were taken from here.
// https://github.com/gatsbyjs/gatsby/blob/master/docs/docs/visual-testing-with-storybook.md
// They're required because the netlify-cms runs on a separate webpack config,
// and outside of Gatsby. This ensures any Gatsby components imported into the
// CMS works without errors

// highlight-start
// Gatsby's Link overrides:
// Gatsby defines a global called ___loader to prevent its method calls from creating console errors you override it here
global.___loader = {
  enqueue: () => {},
  hovering: () => {},
}

// Gatsby internal mocking to prevent unnecessary errors
global.__PATH_PREFIX__ = ``

// This is to utilized to override the window.___navigate method Gatsby defines and uses to report what path a Link would be taking us to
window.___navigate = pathname => {
  alert(`This would navigate to: ${pathname}`)
}

/**
 * The stylesheet output from the modules at `modulePath` will be at `cms.css`.
 */
CMS.registerPreviewStyle(`cms.css`)
