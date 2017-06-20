echo "=== Building ES5 version of Gatsby"
./node_modules/.bin/lerna run build

yarn global add gatsby-dev-cli@canary
gatsby-dev --set-path-to-repo .

echo "=== Installing the website dependencies"
cd $1
# Normally you wouldn't do this but we
# want to test the latest versions of packages always
# so our example site builds catch problems early.
rm yarn.lock
yarn

echo "=== Copying built Gatsby to website."
gatsby-dev --scan-once --quiet

echo "=== Building website"
# Once we get better cache invalidation, remove the following
# line.
rm -rf .cache

echo "temp delete offline-plugin gatsby-ssr.js"
rm ./node_modules/gatsby-plugin-offline/gatsby-ssr.js

./node_modules/.bin/gatsby build
