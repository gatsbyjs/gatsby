echo "=== Building ES5 version of Gatsby"
./node_modules/.bin/lerna run build
cd examples/gatsbygram
echo "=== Installing the website dependencies"
yarn
ls ./node_modules | grep stable
echo "=== Overwrite website node_modules with Gatsby's."
cp -r ../node_modules/* ./node_modules/
ls ./node_modules | grep stable
echo "=== Copying built Gatsby to website."
cp -r ../packages/gatsby/dist ./node_modules/gatsby/dist
echo "=== Building website"
./node_modules/.bin/gatsby build
