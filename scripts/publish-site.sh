echo "=== Building ES5 version of Gatsby"
./node_modules/.bin/lerna bootstrap
./node_modules/.bin/lerna run build
cd www
echo "=== Installing the website dependencies"
yarn
echo "=== Overwrite website node_modules with Gatsby's."
cp -r ../node_modules/* ./node_modules/
echo "=== Copying built Gatsby to website."
cp -r ../packages/gatsby/dist ./node_modules/gatsby/dist
echo "=== Building website"
./node_modules/.bin/gatsby build
