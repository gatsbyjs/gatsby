echo "=== Building ES5 version of Gatsby"
./node_modules/.bin/lerna run build

yarn global add gatsby-dev-cli@canary
gatsby-dev --set-path-to-repo .

echo "=== Installing the website dependencies"
cd $1
yarn

echo "=== Copying built Gatsby to website."
gatsby-dev --scan-once --quiet

echo "=== find graphql packages"

find node_modules -name graphql
echo "=== END find graphql packages"

echo "=== Building website"
# Once we get better cache invalidation, remove the following
# line.
rm -rf .cache

./node_modules/.bin/gatsby build
