echo "=== Building ES5 version of Gatsby"
./node_modules/.bin/lerna bootstrap --npm-client=yarn
./node_modules/.bin/lerna run build

echo "=== Installing the website dependencies"
cd www
yarn

echo "=== Copying built Gatsby to website."
yarn global add gatsby-dev-cli@canary
gatsby-dev --set-path-to-repo ../
gatsby-dev --scan-once

echo "=== Building website"
rm -rf .cache
./node_modules/.bin/gatsby build
