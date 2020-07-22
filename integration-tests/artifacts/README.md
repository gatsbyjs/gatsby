## Artifacts test suite

This integration test suite helps us assert some of the artifacts written out for a Gatsby build. The test suite runs a real Gatsby build and then checks the generated `public` directory for `page-data.json` files. Since we added static query hashes to `page-data.json` files, the tests in this suite assert whether the correct static query hashes are included in every respective page.
