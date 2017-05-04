echo "=== Building ES5 version of Gatsby"
./node_modules/.bin/lerna run build

yarn global add gatsby-dev-cli@canary
gatsby-dev --set-path-to-repo .

echo "=== Installing the website dependencies"
cd $1
rm -rf node_modules
yarn

echo "=== contents of .bin"
ls -lahL node_modules/.bin
echo "==="

echo "=== Copying built Gatsby to website."
gatsby-dev --scan-once --quiet

echo "=== Building website"
# Once we get better cache invalidation, remove the following
# line.
rm -rf .cache

node ./node_modules/.bin/gatsby build
