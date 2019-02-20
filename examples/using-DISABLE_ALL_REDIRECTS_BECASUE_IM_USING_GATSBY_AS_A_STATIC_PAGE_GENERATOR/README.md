# using-DISABLE_ALL_REDIRECTS_BECASUE_IM_USING_GATSBY_AS_A_STATIC_PAGE_GENERATOR

To test this example site locally run the following commands from this directory

```bash
npm run build
cd public
python -m SimpleHTTPServer 9000
```

Assuming that `disableAllRedirectsBecasueImUsingGatsbyAsAStaticPageGenerator` is
still set to `true` in gatsby-config.js, navigate to
http://localhost:9000/index.html in a web browser and notice that the URL does
not change to http://localhost:9000, which is Gatsby's default behavior.

This behavior is desirable when:

- embedding a Gatsby application in a host web page
- serving a Gatsby application via an Nginx alias or similar
- serving a Gatsby application from an S3 sub-bucket or similar

PRs containing additional use-cases would be most welcome.
