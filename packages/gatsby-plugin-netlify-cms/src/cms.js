/* eslint-disable no-unused-vars */
/* eslint-env browser */
import CMS from "netlify-cms"
import "netlify-cms/dist/cms.css"
import netlifyIdentityWidget from "netlify-identity-widget"

window.netlifyIdentity = netlifyIdentityWidget
netlifyIdentityWidget.init()
