echo "=== Building ES5 version of Gatsby"
npm run build
cd www
echo "=== Installing the website dependencies"
npm install
ls ./node_modules | grep stable
echo "=== Overwrite website node_modules with Gatsby's."
cp -r ../node_modules/* ./node_modules/
ls ./node_modules | grep stable
echo "=== Copying built Gatsby to website."
cp -r ../dist ./node_modules/gatsby/
echo "=== Building website"
./node_modules/.bin/gatsby build
